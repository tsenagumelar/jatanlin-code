CREATE OR REPLACE FUNCTION public.auto_generate_wim_session_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  year_str varchar(4);
  seq_num int;
  new_code varchar(50);
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(
    CASE
      WHEN code ~ ('^WIM-' || year_str || '-[0-9]+$')
      THEN CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO seq_num
  FROM public.transact_wim_session;

  new_code := 'WIM-' || year_str || '-' || LPAD(seq_num::text, 4, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_wim_session_code ON public.transact_wim_session;

CREATE TRIGGER trigger_generate_wim_session_code
BEFORE INSERT ON public.transact_wim_session
FOR EACH ROW
WHEN (NEW.code IS NULL OR NEW.code = '')
EXECUTE FUNCTION public.auto_generate_wim_session_code();
