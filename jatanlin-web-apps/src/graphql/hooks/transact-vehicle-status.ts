import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type VehicleStatusDetailsFragment = { id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } };

export type GetVehicleStatusQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Vehicle_Status_Bool_Exp>;
}>;


export type GetVehicleStatusQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }>, transact_vehicle_status_aggregate: { aggregate?: { count: number } | null } };

export type GetVehicleStatusByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetVehicleStatusByIdQuery = { transact_vehicle_status_by_pk?: { id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } } | null };

export type GetVehicleStatusByActualIdQueryVariables = Types.Exact<{
  transact_vehicle_actual_id: Types.Scalars['uuid']['input'];
}>;


export type GetVehicleStatusByActualIdQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type GetVehicleStatusBySiteQueryVariables = Types.Exact<{
  site_id: Types.Scalars['uuid']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetVehicleStatusBySiteQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type GetVehicleStatusByTypeQueryVariables = Types.Exact<{
  status: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetVehicleStatusByTypeQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type GetVehicleStatusByResultQueryVariables = Types.Exact<{
  result: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetVehicleStatusByResultQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type GetVehicleStatusByDateRangeQueryVariables = Types.Exact<{
  start_date: Types.Scalars['timestamptz']['input'];
  end_date: Types.Scalars['timestamptz']['input'];
}>;


export type GetVehicleStatusByDateRangeQuery = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type GetVehicleStatusStatisticsQueryVariables = Types.Exact<{
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GetVehicleStatusStatisticsQuery = { detected: { aggregate?: { count: number } | null }, verified: { aggregate?: { count: number } | null }, odol: { aggregate?: { count: number } | null }, normal: { aggregate?: { count: number } | null }, rejected: { aggregate?: { count: number } | null } };

export type InsertVehicleStatusMutationVariables = Types.Exact<{
  object: Types.Transact_Vehicle_Status_Insert_Input;
}>;


export type InsertVehicleStatusMutation = { insert_transact_vehicle_status_one?: { id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } } | null };

export type InsertVehicleStatusBatchMutationVariables = Types.Exact<{
  objects: Array<Types.Transact_Vehicle_Status_Insert_Input> | Types.Transact_Vehicle_Status_Insert_Input;
}>;


export type InsertVehicleStatusBatchMutation = { insert_transact_vehicle_status?: { affected_rows: number, returning: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> } | null };

export type UpdateVehicleStatusMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Vehicle_Status_Set_Input;
}>;


export type UpdateVehicleStatusMutation = { update_transact_vehicle_status_by_pk?: { id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } } | null };

export type UpdateVehicleStatusByActualIdMutationVariables = Types.Exact<{
  transact_vehicle_actual_id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Vehicle_Status_Set_Input;
}>;


export type UpdateVehicleStatusByActualIdMutation = { update_transact_vehicle_status?: { affected_rows: number, returning: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> } | null };

export type SoftDeleteVehicleStatusMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteVehicleStatusMutation = { update_transact_vehicle_status_by_pk?: { id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type DeleteVehicleStatusMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type DeleteVehicleStatusMutation = { delete_transact_vehicle_status_by_pk?: { id: any, transact_vehicle_actual_id: any, status: string } | null };

export type SubscribeLatestVehicleStatusSubscriptionVariables = Types.Exact<{
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestVehicleStatusSubscription = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type SubscribeVehicleStatusByActualIdSubscriptionVariables = Types.Exact<{
  transact_vehicle_actual_id: Types.Scalars['uuid']['input'];
}>;


export type SubscribeVehicleStatusByActualIdSubscription = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type SubscribeVehicleStatusByTypeSubscriptionVariables = Types.Exact<{
  status: Types.Scalars['String']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeVehicleStatusByTypeSubscription = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export type SubscribeVehicleStatusByResultSubscriptionVariables = Types.Exact<{
  result: Types.Scalars['String']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeVehicleStatusByResultSubscription = { transact_vehicle_status: Array<{ id: any, transact_vehicle_actual_id: any, status: string, result?: string | null, notes?: string | null, attachment?: Array<string> | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, transact_vehicle_actual: { id: any, anpr_id: any, axle_id?: any | null, transact_dimension_id?: any | null, transact_weighing_id?: any | null, actual_width?: any | null, actual_length?: any | null, actual_height?: any | null, actual_weight?: any | null, site_id?: any | null, transact_anpr_capture: { id: any, external_id: string, plate_no: string, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket: string, minio_date_folder: string, minio_full_image_object: string, minio_plate_image_object: string }, transact_axle_capture?: { id: any, external_id: string, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket: string, minio_date_folder: string, minio_image_object: string } | null, transact_weighing?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null } | null, transact_dimension?: { id: any, anpr_id: any, filepath: string, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null } | null } }> };

export const VehicleStatusDetailsFragmentDoc = gql`
    fragment VehicleStatusDetails on transact_vehicle_status {
  id
  transact_vehicle_actual_id
  status
  result
  notes
  attachment
  is_active
  is_deleted
  created_by
  created_date
  updated_by
  updated_date
  site_id
  transact_vehicle_actual {
    id
    anpr_id
    axle_id
    transact_dimension_id
    transact_weighing_id
    actual_width
    actual_length
    actual_height
    actual_weight
    site_id
    transact_anpr_capture {
      id
      external_id
      plate_no
      confidence
      captured_at
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
  }
}
    `;
export const GetVehicleStatusDocument = gql`
    query GetVehicleStatus($limit: Int!, $offset: Int!, $where: transact_vehicle_status_bool_exp = {}) {
  transact_vehicle_status(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
  transact_vehicle_status_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetVehicleStatusQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusQuery, GetVehicleStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusQuery, GetVehicleStatusQueryVariables>(GetVehicleStatusDocument, options);
      }
export function useGetVehicleStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusQuery, GetVehicleStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusQuery, GetVehicleStatusQueryVariables>(GetVehicleStatusDocument, options);
        }
export type GetVehicleStatusQueryHookResult = ReturnType<typeof useGetVehicleStatusQuery>;
export type GetVehicleStatusLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusLazyQuery>;
export const GetVehicleStatusByIdDocument = gql`
    query GetVehicleStatusById($id: uuid!) {
  transact_vehicle_status_by_pk(id: $id) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusByIdQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVehicleStatusByIdQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusByIdQuery, GetVehicleStatusByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusByIdQuery, GetVehicleStatusByIdQueryVariables>(GetVehicleStatusByIdDocument, options);
      }
export function useGetVehicleStatusByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusByIdQuery, GetVehicleStatusByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusByIdQuery, GetVehicleStatusByIdQueryVariables>(GetVehicleStatusByIdDocument, options);
        }
export type GetVehicleStatusByIdQueryHookResult = ReturnType<typeof useGetVehicleStatusByIdQuery>;
export type GetVehicleStatusByIdLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusByIdLazyQuery>;
export const GetVehicleStatusByActualIdDocument = gql`
    query GetVehicleStatusByActualId($transact_vehicle_actual_id: uuid!) {
  transact_vehicle_status(
    where: {transact_vehicle_actual_id: {_eq: $transact_vehicle_actual_id}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusByActualIdQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusByActualIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusByActualIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusByActualIdQuery({
 *   variables: {
 *      transact_vehicle_actual_id: // value for 'transact_vehicle_actual_id'
 *   },
 * });
 */
export function useGetVehicleStatusByActualIdQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusByActualIdQuery, GetVehicleStatusByActualIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusByActualIdQuery, GetVehicleStatusByActualIdQueryVariables>(GetVehicleStatusByActualIdDocument, options);
      }
export function useGetVehicleStatusByActualIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusByActualIdQuery, GetVehicleStatusByActualIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusByActualIdQuery, GetVehicleStatusByActualIdQueryVariables>(GetVehicleStatusByActualIdDocument, options);
        }
export type GetVehicleStatusByActualIdQueryHookResult = ReturnType<typeof useGetVehicleStatusByActualIdQuery>;
export type GetVehicleStatusByActualIdLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusByActualIdLazyQuery>;
export const GetVehicleStatusBySiteDocument = gql`
    query GetVehicleStatusBySite($site_id: uuid!, $limit: Int = 10) {
  transact_vehicle_status(
    where: {site_id: {_eq: $site_id}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusBySiteQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusBySiteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusBySiteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusBySiteQuery({
 *   variables: {
 *      site_id: // value for 'site_id'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetVehicleStatusBySiteQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusBySiteQuery, GetVehicleStatusBySiteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusBySiteQuery, GetVehicleStatusBySiteQueryVariables>(GetVehicleStatusBySiteDocument, options);
      }
export function useGetVehicleStatusBySiteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusBySiteQuery, GetVehicleStatusBySiteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusBySiteQuery, GetVehicleStatusBySiteQueryVariables>(GetVehicleStatusBySiteDocument, options);
        }
export type GetVehicleStatusBySiteQueryHookResult = ReturnType<typeof useGetVehicleStatusBySiteQuery>;
export type GetVehicleStatusBySiteLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusBySiteLazyQuery>;
export const GetVehicleStatusByTypeDocument = gql`
    query GetVehicleStatusByType($status: String!, $limit: Int = 10) {
  transact_vehicle_status(
    where: {status: {_eq: $status}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusByTypeQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusByTypeQuery({
 *   variables: {
 *      status: // value for 'status'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetVehicleStatusByTypeQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusByTypeQuery, GetVehicleStatusByTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusByTypeQuery, GetVehicleStatusByTypeQueryVariables>(GetVehicleStatusByTypeDocument, options);
      }
export function useGetVehicleStatusByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusByTypeQuery, GetVehicleStatusByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusByTypeQuery, GetVehicleStatusByTypeQueryVariables>(GetVehicleStatusByTypeDocument, options);
        }
export type GetVehicleStatusByTypeQueryHookResult = ReturnType<typeof useGetVehicleStatusByTypeQuery>;
export type GetVehicleStatusByTypeLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusByTypeLazyQuery>;
export const GetVehicleStatusByResultDocument = gql`
    query GetVehicleStatusByResult($result: String!, $limit: Int = 10) {
  transact_vehicle_status(
    where: {result: {_eq: $result}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusByResultQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusByResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusByResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusByResultQuery({
 *   variables: {
 *      result: // value for 'result'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetVehicleStatusByResultQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusByResultQuery, GetVehicleStatusByResultQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusByResultQuery, GetVehicleStatusByResultQueryVariables>(GetVehicleStatusByResultDocument, options);
      }
export function useGetVehicleStatusByResultLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusByResultQuery, GetVehicleStatusByResultQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusByResultQuery, GetVehicleStatusByResultQueryVariables>(GetVehicleStatusByResultDocument, options);
        }
export type GetVehicleStatusByResultQueryHookResult = ReturnType<typeof useGetVehicleStatusByResultQuery>;
export type GetVehicleStatusByResultLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusByResultLazyQuery>;
export const GetVehicleStatusByDateRangeDocument = gql`
    query GetVehicleStatusByDateRange($start_date: timestamptz!, $end_date: timestamptz!) {
  transact_vehicle_status(
    where: {created_date: {_gte: $start_date, _lte: $end_date}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useGetVehicleStatusByDateRangeQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusByDateRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusByDateRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusByDateRangeQuery({
 *   variables: {
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetVehicleStatusByDateRangeQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleStatusByDateRangeQuery, GetVehicleStatusByDateRangeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusByDateRangeQuery, GetVehicleStatusByDateRangeQueryVariables>(GetVehicleStatusByDateRangeDocument, options);
      }
export function useGetVehicleStatusByDateRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusByDateRangeQuery, GetVehicleStatusByDateRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusByDateRangeQuery, GetVehicleStatusByDateRangeQueryVariables>(GetVehicleStatusByDateRangeDocument, options);
        }
export type GetVehicleStatusByDateRangeQueryHookResult = ReturnType<typeof useGetVehicleStatusByDateRangeQuery>;
export type GetVehicleStatusByDateRangeLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusByDateRangeLazyQuery>;
export const GetVehicleStatusStatisticsDocument = gql`
    query GetVehicleStatusStatistics($site_id: uuid) {
  detected: transact_vehicle_status_aggregate(
    where: {status: {_eq: "detected"}, is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
  ) {
    aggregate {
      count
    }
  }
  verified: transact_vehicle_status_aggregate(
    where: {status: {_eq: "verified"}, is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
  ) {
    aggregate {
      count
    }
  }
  odol: transact_vehicle_status_aggregate(
    where: {status: {_eq: "odol"}, is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
  ) {
    aggregate {
      count
    }
  }
  normal: transact_vehicle_status_aggregate(
    where: {status: {_eq: "normal"}, is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
  ) {
    aggregate {
      count
    }
  }
  rejected: transact_vehicle_status_aggregate(
    where: {status: {_eq: "rejected"}, is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetVehicleStatusStatisticsQuery__
 *
 * To run a query within a React component, call `useGetVehicleStatusStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleStatusStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleStatusStatisticsQuery({
 *   variables: {
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useGetVehicleStatusStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<GetVehicleStatusStatisticsQuery, GetVehicleStatusStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleStatusStatisticsQuery, GetVehicleStatusStatisticsQueryVariables>(GetVehicleStatusStatisticsDocument, options);
      }
export function useGetVehicleStatusStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleStatusStatisticsQuery, GetVehicleStatusStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleStatusStatisticsQuery, GetVehicleStatusStatisticsQueryVariables>(GetVehicleStatusStatisticsDocument, options);
        }
export type GetVehicleStatusStatisticsQueryHookResult = ReturnType<typeof useGetVehicleStatusStatisticsQuery>;
export type GetVehicleStatusStatisticsLazyQueryHookResult = ReturnType<typeof useGetVehicleStatusStatisticsLazyQuery>;
export const InsertVehicleStatusDocument = gql`
    mutation InsertVehicleStatus($object: transact_vehicle_status_insert_input!) {
  insert_transact_vehicle_status_one(object: $object) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useInsertVehicleStatusMutation__
 *
 * To run a mutation, you first call `useInsertVehicleStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertVehicleStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertVehicleStatusMutation, { data, loading, error }] = useInsertVehicleStatusMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertVehicleStatusMutation(baseOptions?: Apollo.MutationHookOptions<InsertVehicleStatusMutation, InsertVehicleStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertVehicleStatusMutation, InsertVehicleStatusMutationVariables>(InsertVehicleStatusDocument, options);
      }
export type InsertVehicleStatusMutationHookResult = ReturnType<typeof useInsertVehicleStatusMutation>;
export const InsertVehicleStatusBatchDocument = gql`
    mutation InsertVehicleStatusBatch($objects: [transact_vehicle_status_insert_input!]!) {
  insert_transact_vehicle_status(objects: $objects) {
    affected_rows
    returning {
      ...VehicleStatusDetails
    }
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useInsertVehicleStatusBatchMutation__
 *
 * To run a mutation, you first call `useInsertVehicleStatusBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertVehicleStatusBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertVehicleStatusBatchMutation, { data, loading, error }] = useInsertVehicleStatusBatchMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertVehicleStatusBatchMutation(baseOptions?: Apollo.MutationHookOptions<InsertVehicleStatusBatchMutation, InsertVehicleStatusBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertVehicleStatusBatchMutation, InsertVehicleStatusBatchMutationVariables>(InsertVehicleStatusBatchDocument, options);
      }
export type InsertVehicleStatusBatchMutationHookResult = ReturnType<typeof useInsertVehicleStatusBatchMutation>;
export const UpdateVehicleStatusDocument = gql`
    mutation UpdateVehicleStatus($id: uuid!, $set: transact_vehicle_status_set_input!) {
  update_transact_vehicle_status_by_pk(pk_columns: {id: $id}, _set: $set) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useUpdateVehicleStatusMutation__
 *
 * To run a mutation, you first call `useUpdateVehicleStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVehicleStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVehicleStatusMutation, { data, loading, error }] = useUpdateVehicleStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateVehicleStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVehicleStatusMutation, UpdateVehicleStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVehicleStatusMutation, UpdateVehicleStatusMutationVariables>(UpdateVehicleStatusDocument, options);
      }
export type UpdateVehicleStatusMutationHookResult = ReturnType<typeof useUpdateVehicleStatusMutation>;
export const UpdateVehicleStatusByActualIdDocument = gql`
    mutation UpdateVehicleStatusByActualId($transact_vehicle_actual_id: uuid!, $set: transact_vehicle_status_set_input!) {
  update_transact_vehicle_status(
    where: {transact_vehicle_actual_id: {_eq: $transact_vehicle_actual_id}}
    _set: $set
  ) {
    affected_rows
    returning {
      ...VehicleStatusDetails
    }
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useUpdateVehicleStatusByActualIdMutation__
 *
 * To run a mutation, you first call `useUpdateVehicleStatusByActualIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVehicleStatusByActualIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVehicleStatusByActualIdMutation, { data, loading, error }] = useUpdateVehicleStatusByActualIdMutation({
 *   variables: {
 *      transact_vehicle_actual_id: // value for 'transact_vehicle_actual_id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateVehicleStatusByActualIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVehicleStatusByActualIdMutation, UpdateVehicleStatusByActualIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVehicleStatusByActualIdMutation, UpdateVehicleStatusByActualIdMutationVariables>(UpdateVehicleStatusByActualIdDocument, options);
      }
export type UpdateVehicleStatusByActualIdMutationHookResult = ReturnType<typeof useUpdateVehicleStatusByActualIdMutation>;
export const SoftDeleteVehicleStatusDocument = gql`
    mutation SoftDeleteVehicleStatus($id: uuid!, $updated_by: uuid!) {
  update_transact_vehicle_status_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    transact_vehicle_actual_id
    status
    result
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteVehicleStatusMutation__
 *
 * To run a mutation, you first call `useSoftDeleteVehicleStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteVehicleStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteVehicleStatusMutation, { data, loading, error }] = useSoftDeleteVehicleStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteVehicleStatusMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteVehicleStatusMutation, SoftDeleteVehicleStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteVehicleStatusMutation, SoftDeleteVehicleStatusMutationVariables>(SoftDeleteVehicleStatusDocument, options);
      }
export type SoftDeleteVehicleStatusMutationHookResult = ReturnType<typeof useSoftDeleteVehicleStatusMutation>;
export const DeleteVehicleStatusDocument = gql`
    mutation DeleteVehicleStatus($id: uuid!) {
  delete_transact_vehicle_status_by_pk(id: $id) {
    id
    transact_vehicle_actual_id
    status
  }
}
    `;

/**
 * __useDeleteVehicleStatusMutation__
 *
 * To run a mutation, you first call `useDeleteVehicleStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVehicleStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVehicleStatusMutation, { data, loading, error }] = useDeleteVehicleStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteVehicleStatusMutation(baseOptions?: Apollo.MutationHookOptions<DeleteVehicleStatusMutation, DeleteVehicleStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteVehicleStatusMutation, DeleteVehicleStatusMutationVariables>(DeleteVehicleStatusDocument, options);
      }
export type DeleteVehicleStatusMutationHookResult = ReturnType<typeof useDeleteVehicleStatusMutation>;
export const SubscribeLatestVehicleStatusDocument = gql`
    subscription SubscribeLatestVehicleStatus($site_id: uuid) {
  transact_vehicle_status(
    where: {is_deleted: {_eq: false}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 1
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useSubscribeLatestVehicleStatusSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestVehicleStatusSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestVehicleStatusSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestVehicleStatusSubscription({
 *   variables: {
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestVehicleStatusSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscribeLatestVehicleStatusSubscription, SubscribeLatestVehicleStatusSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestVehicleStatusSubscription, SubscribeLatestVehicleStatusSubscriptionVariables>(SubscribeLatestVehicleStatusDocument, options);
      }
export type SubscribeLatestVehicleStatusSubscriptionHookResult = ReturnType<typeof useSubscribeLatestVehicleStatusSubscription>;
export const SubscribeVehicleStatusByActualIdDocument = gql`
    subscription SubscribeVehicleStatusByActualId($transact_vehicle_actual_id: uuid!) {
  transact_vehicle_status(
    where: {is_deleted: {_eq: false}, transact_vehicle_actual_id: {_eq: $transact_vehicle_actual_id}}
    order_by: {created_date: desc}
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useSubscribeVehicleStatusByActualIdSubscription__
 *
 * To run a query within a React component, call `useSubscribeVehicleStatusByActualIdSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeVehicleStatusByActualIdSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeVehicleStatusByActualIdSubscription({
 *   variables: {
 *      transact_vehicle_actual_id: // value for 'transact_vehicle_actual_id'
 *   },
 * });
 */
export function useSubscribeVehicleStatusByActualIdSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeVehicleStatusByActualIdSubscription, SubscribeVehicleStatusByActualIdSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeVehicleStatusByActualIdSubscription, SubscribeVehicleStatusByActualIdSubscriptionVariables>(SubscribeVehicleStatusByActualIdDocument, options);
      }
export type SubscribeVehicleStatusByActualIdSubscriptionHookResult = ReturnType<typeof useSubscribeVehicleStatusByActualIdSubscription>;
export const SubscribeVehicleStatusByTypeDocument = gql`
    subscription SubscribeVehicleStatusByType($status: String!, $site_id: uuid) {
  transact_vehicle_status(
    where: {is_deleted: {_eq: false}, status: {_eq: $status}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 10
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useSubscribeVehicleStatusByTypeSubscription__
 *
 * To run a query within a React component, call `useSubscribeVehicleStatusByTypeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeVehicleStatusByTypeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeVehicleStatusByTypeSubscription({
 *   variables: {
 *      status: // value for 'status'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeVehicleStatusByTypeSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeVehicleStatusByTypeSubscription, SubscribeVehicleStatusByTypeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeVehicleStatusByTypeSubscription, SubscribeVehicleStatusByTypeSubscriptionVariables>(SubscribeVehicleStatusByTypeDocument, options);
      }
export type SubscribeVehicleStatusByTypeSubscriptionHookResult = ReturnType<typeof useSubscribeVehicleStatusByTypeSubscription>;
export const SubscribeVehicleStatusByResultDocument = gql`
    subscription SubscribeVehicleStatusByResult($result: String!, $site_id: uuid) {
  transact_vehicle_status(
    where: {is_deleted: {_eq: false}, result: {_eq: $result}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 10
  ) {
    ...VehicleStatusDetails
  }
}
    ${VehicleStatusDetailsFragmentDoc}`;

/**
 * __useSubscribeVehicleStatusByResultSubscription__
 *
 * To run a query within a React component, call `useSubscribeVehicleStatusByResultSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeVehicleStatusByResultSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeVehicleStatusByResultSubscription({
 *   variables: {
 *      result: // value for 'result'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeVehicleStatusByResultSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeVehicleStatusByResultSubscription, SubscribeVehicleStatusByResultSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeVehicleStatusByResultSubscription, SubscribeVehicleStatusByResultSubscriptionVariables>(SubscribeVehicleStatusByResultDocument, options);
      }
export type SubscribeVehicleStatusByResultSubscriptionHookResult = ReturnType<typeof useSubscribeVehicleStatusByResultSubscription>;