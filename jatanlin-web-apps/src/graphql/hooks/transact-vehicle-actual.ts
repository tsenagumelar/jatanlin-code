import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type VehicleActualDetailsFragment = { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> };

export type GetVehicleActualsQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Vehicle_Actual_Bool_Exp>;
}>;


export type GetVehicleActualsQuery = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }>, transact_vehicle_actual_aggregate: { aggregate?: { count: number } | null } };

export type GetVehicleActualByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetVehicleActualByIdQuery = { transact_vehicle_actual_by_pk?: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> } | null };

export type GetVehicleActualsByAnprIdQueryVariables = Types.Exact<{
  anpr_id: Types.Scalars['uuid']['input'];
}>;


export type GetVehicleActualsByAnprIdQuery = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export type GetVehicleActualsBySiteQueryVariables = Types.Exact<{
  site_id: Types.Scalars['uuid']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetVehicleActualsBySiteQuery = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export type GetVehicleHistoryByPlateQueryVariables = Types.Exact<{
  plate_no: Types.Scalars['String']['input'];
}>;


export type GetVehicleHistoryByPlateQuery = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export type GetVehicleActualsByDateRangeQueryVariables = Types.Exact<{
  start_date: Types.Scalars['timestamptz']['input'];
  end_date: Types.Scalars['timestamptz']['input'];
}>;


export type GetVehicleActualsByDateRangeQuery = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export type InsertVehicleActualMutationVariables = Types.Exact<{
  object: Types.Transact_Vehicle_Actual_Insert_Input;
}>;


export type InsertVehicleActualMutation = { insert_transact_vehicle_actual_one?: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> } | null };

export type UpdateVehicleActualMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Vehicle_Actual_Set_Input;
}>;


export type UpdateVehicleActualMutation = { update_transact_vehicle_actual_by_pk?: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> } | null };

export type SoftDeleteVehicleActualMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteVehicleActualMutation = { update_transact_vehicle_actual_by_pk?: { id: any, anpr_id: any, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null } | null };

export type SubscribeLatestVehicleActualSubscriptionVariables = Types.Exact<{
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestVehicleActualSubscription = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export type SubscribeVehicleActualsByAnprSubscriptionVariables = Types.Exact<{
  anpr_id: Types.Scalars['uuid']['input'];
}>;


export type SubscribeVehicleActualsByAnprSubscription = { transact_vehicle_actual: Array<{ id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, actual_plat_no?: string | null, actual_total_axle?: number | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, location_lat?: any | null, location_lng?: any | null, location_address?: string | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, created_date?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, created_date?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_vehicle_statuses: Array<{ id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }> }> };

export const VehicleActualDetailsFragmentDoc = gql`
    fragment VehicleActualDetails on transact_vehicle_actual {
  id
  anpr_id
  axle_id
  transact_dimension_id
  transact_weighing_id
  actual_width
  actual_length
  actual_height
  actual_weight
  actual_plat_no
  actual_total_axle
  is_active
  is_deleted
  created_by
  created_date
  updated_by
  updated_date
  site_id
  location_lat
  location_lng
  location_address
  transact_cctv_id
  transact_anpr_capture {
    id
    external_id
    plate_no
    confidence
    captured_at
    created_date
    location_code
    camera_id
    minio_bucket
    minio_date_folder
    minio_full_image_object
    minio_plate_image_object
  }
  transact_axle_capture {
    id
    external_id
    plate_no
    captured_at
    created_date
    camera_id
    length_mm
    total_wheels
    total_axles
    vehicle_category
    vehicle_body_type
    minio_bucket
    minio_date_folder
    minio_image_object
  }
  transact_weighing {
    id
    total_axle
    axle_detail
    total_weight
    is_active
    created_date
  }
  transact_dimension {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    created_date
  }
  transact_cctv {
    id
    filename
    filepath
    created_date
  }
  transact_vehicle_statuses(
    where: {is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    id
    status
    result
    notes
    attachment
    is_active
    created_by
    created_date
    updated_by
    updated_date
  }
}
    `;
export const GetVehicleActualsDocument = gql`
    query GetVehicleActuals($limit: Int!, $offset: Int!, $where: transact_vehicle_actual_bool_exp = {}) {
  transact_vehicle_actual(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {created_date: desc}
  ) {
    ...VehicleActualDetails
  }
  transact_vehicle_actual_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleActualsQuery__
 *
 * To run a query within a React component, call `useGetVehicleActualsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleActualsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleActualsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetVehicleActualsQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleActualsQuery, GetVehicleActualsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleActualsQuery, GetVehicleActualsQueryVariables>(GetVehicleActualsDocument, options);
      }
export function useGetVehicleActualsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleActualsQuery, GetVehicleActualsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleActualsQuery, GetVehicleActualsQueryVariables>(GetVehicleActualsDocument, options);
        }
export type GetVehicleActualsQueryHookResult = ReturnType<typeof useGetVehicleActualsQuery>;
export type GetVehicleActualsLazyQueryHookResult = ReturnType<typeof useGetVehicleActualsLazyQuery>;
export const GetVehicleActualByIdDocument = gql`
    query GetVehicleActualById($id: uuid!) {
  transact_vehicle_actual_by_pk(id: $id) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleActualByIdQuery__
 *
 * To run a query within a React component, call `useGetVehicleActualByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleActualByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleActualByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVehicleActualByIdQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleActualByIdQuery, GetVehicleActualByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleActualByIdQuery, GetVehicleActualByIdQueryVariables>(GetVehicleActualByIdDocument, options);
      }
export function useGetVehicleActualByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleActualByIdQuery, GetVehicleActualByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleActualByIdQuery, GetVehicleActualByIdQueryVariables>(GetVehicleActualByIdDocument, options);
        }
export type GetVehicleActualByIdQueryHookResult = ReturnType<typeof useGetVehicleActualByIdQuery>;
export type GetVehicleActualByIdLazyQueryHookResult = ReturnType<typeof useGetVehicleActualByIdLazyQuery>;
export const GetVehicleActualsByAnprIdDocument = gql`
    query GetVehicleActualsByAnprId($anpr_id: uuid!) {
  transact_vehicle_actual(
    where: {anpr_id: {_eq: $anpr_id}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleActualsByAnprIdQuery__
 *
 * To run a query within a React component, call `useGetVehicleActualsByAnprIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleActualsByAnprIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleActualsByAnprIdQuery({
 *   variables: {
 *      anpr_id: // value for 'anpr_id'
 *   },
 * });
 */
export function useGetVehicleActualsByAnprIdQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleActualsByAnprIdQuery, GetVehicleActualsByAnprIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleActualsByAnprIdQuery, GetVehicleActualsByAnprIdQueryVariables>(GetVehicleActualsByAnprIdDocument, options);
      }
export function useGetVehicleActualsByAnprIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleActualsByAnprIdQuery, GetVehicleActualsByAnprIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleActualsByAnprIdQuery, GetVehicleActualsByAnprIdQueryVariables>(GetVehicleActualsByAnprIdDocument, options);
        }
export type GetVehicleActualsByAnprIdQueryHookResult = ReturnType<typeof useGetVehicleActualsByAnprIdQuery>;
export type GetVehicleActualsByAnprIdLazyQueryHookResult = ReturnType<typeof useGetVehicleActualsByAnprIdLazyQuery>;
export const GetVehicleActualsBySiteDocument = gql`
    query GetVehicleActualsBySite($site_id: uuid!, $limit: Int = 10) {
  transact_vehicle_actual(
    where: {site_id: {_eq: $site_id}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleActualsBySiteQuery__
 *
 * To run a query within a React component, call `useGetVehicleActualsBySiteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleActualsBySiteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleActualsBySiteQuery({
 *   variables: {
 *      site_id: // value for 'site_id'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetVehicleActualsBySiteQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleActualsBySiteQuery, GetVehicleActualsBySiteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleActualsBySiteQuery, GetVehicleActualsBySiteQueryVariables>(GetVehicleActualsBySiteDocument, options);
      }
export function useGetVehicleActualsBySiteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleActualsBySiteQuery, GetVehicleActualsBySiteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleActualsBySiteQuery, GetVehicleActualsBySiteQueryVariables>(GetVehicleActualsBySiteDocument, options);
        }
export type GetVehicleActualsBySiteQueryHookResult = ReturnType<typeof useGetVehicleActualsBySiteQuery>;
export type GetVehicleActualsBySiteLazyQueryHookResult = ReturnType<typeof useGetVehicleActualsBySiteLazyQuery>;
export const GetVehicleHistoryByPlateDocument = gql`
    query GetVehicleHistoryByPlate($plate_no: String!) {
  transact_vehicle_actual(
    where: {_and: [{is_deleted: {_eq: false}}, {_or: [{actual_plat_no: {_ilike: $plate_no}}, {transact_anpr_capture: {plate_no: {_ilike: $plate_no}}}]}, {transact_vehicle_statuses: {status: {_in: ["verified", "rejected"]}}}]}
    order_by: {created_date: desc}
    limit: 50
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleHistoryByPlateQuery__
 *
 * To run a query within a React component, call `useGetVehicleHistoryByPlateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleHistoryByPlateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleHistoryByPlateQuery({
 *   variables: {
 *      plate_no: // value for 'plate_no'
 *   },
 * });
 */
export function useGetVehicleHistoryByPlateQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleHistoryByPlateQuery, GetVehicleHistoryByPlateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleHistoryByPlateQuery, GetVehicleHistoryByPlateQueryVariables>(GetVehicleHistoryByPlateDocument, options);
      }
export function useGetVehicleHistoryByPlateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleHistoryByPlateQuery, GetVehicleHistoryByPlateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleHistoryByPlateQuery, GetVehicleHistoryByPlateQueryVariables>(GetVehicleHistoryByPlateDocument, options);
        }
export type GetVehicleHistoryByPlateQueryHookResult = ReturnType<typeof useGetVehicleHistoryByPlateQuery>;
export type GetVehicleHistoryByPlateLazyQueryHookResult = ReturnType<typeof useGetVehicleHistoryByPlateLazyQuery>;
export const GetVehicleActualsByDateRangeDocument = gql`
    query GetVehicleActualsByDateRange($start_date: timestamptz!, $end_date: timestamptz!) {
  transact_vehicle_actual(
    where: {created_date: {_gte: $start_date, _lte: $end_date}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useGetVehicleActualsByDateRangeQuery__
 *
 * To run a query within a React component, call `useGetVehicleActualsByDateRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleActualsByDateRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleActualsByDateRangeQuery({
 *   variables: {
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetVehicleActualsByDateRangeQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleActualsByDateRangeQuery, GetVehicleActualsByDateRangeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleActualsByDateRangeQuery, GetVehicleActualsByDateRangeQueryVariables>(GetVehicleActualsByDateRangeDocument, options);
      }
export function useGetVehicleActualsByDateRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleActualsByDateRangeQuery, GetVehicleActualsByDateRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleActualsByDateRangeQuery, GetVehicleActualsByDateRangeQueryVariables>(GetVehicleActualsByDateRangeDocument, options);
        }
export type GetVehicleActualsByDateRangeQueryHookResult = ReturnType<typeof useGetVehicleActualsByDateRangeQuery>;
export type GetVehicleActualsByDateRangeLazyQueryHookResult = ReturnType<typeof useGetVehicleActualsByDateRangeLazyQuery>;
export const InsertVehicleActualDocument = gql`
    mutation InsertVehicleActual($object: transact_vehicle_actual_insert_input!) {
  insert_transact_vehicle_actual_one(object: $object) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useInsertVehicleActualMutation__
 *
 * To run a mutation, you first call `useInsertVehicleActualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertVehicleActualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertVehicleActualMutation, { data, loading, error }] = useInsertVehicleActualMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertVehicleActualMutation(baseOptions?: Apollo.MutationHookOptions<InsertVehicleActualMutation, InsertVehicleActualMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertVehicleActualMutation, InsertVehicleActualMutationVariables>(InsertVehicleActualDocument, options);
      }
export type InsertVehicleActualMutationHookResult = ReturnType<typeof useInsertVehicleActualMutation>;
export const UpdateVehicleActualDocument = gql`
    mutation UpdateVehicleActual($id: uuid!, $set: transact_vehicle_actual_set_input!) {
  update_transact_vehicle_actual_by_pk(pk_columns: {id: $id}, _set: $set) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useUpdateVehicleActualMutation__
 *
 * To run a mutation, you first call `useUpdateVehicleActualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVehicleActualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVehicleActualMutation, { data, loading, error }] = useUpdateVehicleActualMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateVehicleActualMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVehicleActualMutation, UpdateVehicleActualMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVehicleActualMutation, UpdateVehicleActualMutationVariables>(UpdateVehicleActualDocument, options);
      }
export type UpdateVehicleActualMutationHookResult = ReturnType<typeof useUpdateVehicleActualMutation>;
export const SoftDeleteVehicleActualDocument = gql`
    mutation SoftDeleteVehicleActual($id: uuid!, $updated_by: uuid!) {
  update_transact_vehicle_actual_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    anpr_id
    is_deleted
    is_active
    updated_by
    updated_date
    location_lat
    location_lng
    location_address
  }
}
    `;

/**
 * __useSoftDeleteVehicleActualMutation__
 *
 * To run a mutation, you first call `useSoftDeleteVehicleActualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteVehicleActualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteVehicleActualMutation, { data, loading, error }] = useSoftDeleteVehicleActualMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteVehicleActualMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteVehicleActualMutation, SoftDeleteVehicleActualMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteVehicleActualMutation, SoftDeleteVehicleActualMutationVariables>(SoftDeleteVehicleActualDocument, options);
      }
export type SoftDeleteVehicleActualMutationHookResult = ReturnType<typeof useSoftDeleteVehicleActualMutation>;
export const SubscribeLatestVehicleActualDocument = gql`
    subscription SubscribeLatestVehicleActual($site_id: uuid) {
  transact_vehicle_actual(
    where: {is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 1
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useSubscribeLatestVehicleActualSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestVehicleActualSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestVehicleActualSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestVehicleActualSubscription({
 *   variables: {
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestVehicleActualSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscribeLatestVehicleActualSubscription, SubscribeLatestVehicleActualSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestVehicleActualSubscription, SubscribeLatestVehicleActualSubscriptionVariables>(SubscribeLatestVehicleActualDocument, options);
      }
export type SubscribeLatestVehicleActualSubscriptionHookResult = ReturnType<typeof useSubscribeLatestVehicleActualSubscription>;
export const SubscribeVehicleActualsByAnprDocument = gql`
    subscription SubscribeVehicleActualsByAnpr($anpr_id: uuid!) {
  transact_vehicle_actual(
    where: {is_deleted: {_eq: false}, anpr_id: {_eq: $anpr_id}}
    order_by: {created_date: desc}
  ) {
    ...VehicleActualDetails
  }
}
    ${VehicleActualDetailsFragmentDoc}`;

/**
 * __useSubscribeVehicleActualsByAnprSubscription__
 *
 * To run a query within a React component, call `useSubscribeVehicleActualsByAnprSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeVehicleActualsByAnprSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeVehicleActualsByAnprSubscription({
 *   variables: {
 *      anpr_id: // value for 'anpr_id'
 *   },
 * });
 */
export function useSubscribeVehicleActualsByAnprSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeVehicleActualsByAnprSubscription, SubscribeVehicleActualsByAnprSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeVehicleActualsByAnprSubscription, SubscribeVehicleActualsByAnprSubscriptionVariables>(SubscribeVehicleActualsByAnprDocument, options);
      }
export type SubscribeVehicleActualsByAnprSubscriptionHookResult = ReturnType<typeof useSubscribeVehicleActualsByAnprSubscription>;
