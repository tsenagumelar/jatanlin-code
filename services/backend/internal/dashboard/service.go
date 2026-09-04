package dashboard

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Service struct {
	db     *sql.DB
	siteID string
}

type Metrics struct {
	ODOL            int `json:"odol"`
	Violations      int `json:"violations"`
	Normal          int `json:"normal"`
	TodayViolations int `json:"today_violations"`
	Pending         int `json:"pending"`
}

type Trend struct {
	Date          string `json:"date"`
	OverDimension int    `json:"over_dimension"`
	OverLoading   int    `json:"over_loading"`
	Normal        int    `json:"normal"`
}

type RecentViolation struct {
	ID       string `json:"id"`
	Time     string `json:"time"`
	Plate    string `json:"plate"`
	Location string `json:"location"`
	Result   string `json:"result"`
	Officer  string `json:"officer"`
	Status   string `json:"status"`
}

type Summary struct {
	SiteID       string            `json:"site_id"`
	Timezone     string            `json:"timezone"`
	StartDate    string            `json:"start_date"`
	EndDate      string            `json:"end_date"`
	Metrics      Metrics           `json:"metrics"`
	Trend        []Trend           `json:"trend"`
	Recent       []RecentViolation `json:"recent_violations"`
	Distribution map[string]int    `json:"distribution"`
}

func NewService(db *sql.DB, siteID string) (*Service, error) {
	if strings.TrimSpace(siteID) == "" {
		return nil, fmt.Errorf("dashboard site id is required")
	}
	return &Service{db: db, siteID: siteID}, nil
}

func (s *Service) Summary(ctx context.Context) (*Summary, error) {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: true, Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	result := &Summary{SiteID: s.siteID, Trend: []Trend{}, Recent: []RecentViolation{}}
	err = tx.QueryRowContext(ctx, dashboardBaseCTE+`
		SELECT timezone,start_date::text,end_date::text,
		 count(*) FILTER (WHERE authoritative AND result<>'Normal'),
		 count(*) FILTER (WHERE authoritative AND result<>'Normal'),
		 count(*) FILTER (WHERE authoritative AND result='Normal'),
		 count(*) FILTER (WHERE authoritative AND result<>'Normal' AND local_date=end_date),
		 count(*) FILTER (WHERE NOT authoritative)
		FROM classified CROSS JOIN bounds
		GROUP BY timezone,start_date,end_date`, s.siteID).Scan(
		&result.Timezone, &result.StartDate, &result.EndDate,
		&result.Metrics.ODOL, &result.Metrics.Violations, &result.Metrics.Normal,
		&result.Metrics.TodayViolations, &result.Metrics.Pending,
	)
	if err != nil {
		return nil, err
	}

	rows, err := tx.QueryContext(ctx, dashboardBaseCTE+`
		SELECT day::text,
		 count(c.id) FILTER (WHERE c.authoritative AND c.result IN ('Over Dimension','Over Dimension & Over Loading')),
		 count(c.id) FILTER (WHERE c.authoritative AND c.result IN ('Over Loading','Over Dimension & Over Loading')),
		 count(c.id) FILTER (WHERE c.authoritative AND c.result='Normal')
		FROM bounds CROSS JOIN LATERAL generate_series(start_date,end_date,'1 day') day
		LEFT JOIN classified c ON c.local_date=day::date
		GROUP BY day ORDER BY day`, s.siteID)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var trend Trend
		if err := rows.Scan(&trend.Date, &trend.OverDimension, &trend.OverLoading, &trend.Normal); err != nil {
			rows.Close()
			return nil, err
		}
		result.Trend = append(result.Trend, trend)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}

	rows, err = tx.QueryContext(ctx, dashboardBaseCTE+`
		SELECT id::text,created_date::text,COALESCE(actual_plat_no,'-'),COALESCE(location_address,'-'),
		 result,COALESCE(officer,'-'),current_status
		FROM classified
		WHERE authoritative AND result<>'Normal'
		ORDER BY created_date DESC LIMIT 10`, s.siteID)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var recent RecentViolation
		if err := rows.Scan(&recent.ID, &recent.Time, &recent.Plate, &recent.Location, &recent.Result, &recent.Officer, &recent.Status); err != nil {
			rows.Close()
			return nil, err
		}
		result.Recent = append(result.Recent, recent)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}

	var overDimension, overLoading, normal int
	if err := tx.QueryRowContext(ctx, dashboardBaseCTE+`
		SELECT
		 count(*) FILTER (WHERE authoritative AND result IN ('Over Dimension','Over Dimension & Over Loading')),
		 count(*) FILTER (WHERE authoritative AND result IN ('Over Loading','Over Dimension & Over Loading')),
		 count(*) FILTER (WHERE authoritative AND result='Normal')
		FROM classified`, s.siteID).Scan(
		&overDimension, &overLoading, &normal,
	); err != nil {
		return nil, err
	}
	result.Distribution = map[string]int{
		"over_dimension": overDimension,
		"over_loading":   overLoading,
		"normal":         normal,
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return result, nil
}

const dashboardBaseCTE = `
	WITH site_context AS (
	 SELECT id,COALESCE(NULLIF(site_timezone,''),'Asia/Jakarta') timezone
	 FROM public.master_site WHERE id=$1 AND is_deleted=false
	), bounds AS (
	 SELECT timezone,(now() AT TIME ZONE timezone)::date-6 start_date,
	        (now() AT TIME ZONE timezone)::date end_date
	 FROM site_context
	), classified AS (
	 SELECT a.id,a.created_date,a.actual_plat_no,a.location_address,
	        (a.created_date AT TIME ZONE b.timezone)::date local_date,
	        COALESCE(s.status,'pending') current_status,COALESCE(s.result,'Pending') result,
	        COALESCE(s.status='verified' AND s.result IN ('Normal','Over Dimension','Over Loading','Over Dimension & Over Loading'),false) authoritative,
	        u.full_name officer
	 FROM public.transact_vehicle_actual a CROSS JOIN bounds b
	 LEFT JOIN public.transact_vehicle_status s ON s.transact_vehicle_actual_id=a.id
	  AND s.is_active=true AND s.is_deleted=false
	 LEFT JOIN public.master_user u ON u.id=s.created_by
	 WHERE a.site_id=$1 AND a.is_deleted=false
	  AND a.created_date >= (b.start_date::timestamp AT TIME ZONE b.timezone)
	  AND a.created_date < ((b.end_date+1)::timestamp AT TIME ZONE b.timezone)
	)`
