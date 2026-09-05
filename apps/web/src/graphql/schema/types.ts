export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  jsonb: { input: unknown; output: unknown; }
  numeric: { input: unknown; output: unknown; }
  timestamp: { input: unknown; output: unknown; }
  timestamptz: { input: unknown; output: unknown; }
  uuid: { input: unknown; output: unknown; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _eq?: InputMaybe<Array<Scalars['String']['input']>>;
  _gt?: InputMaybe<Array<Scalars['String']['input']>>;
  _gte?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['String']['input']>>;
  _lte?: InputMaybe<Array<Scalars['String']['input']>>;
  _neq?: InputMaybe<Array<Scalars['String']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** columns and relationships of "master_config" */
export type Master_Config = {
  code: Scalars['String']['output'];
  config_key: Scalars['String']['output'];
  config_type: Scalars['String']['output'];
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  master_config?: Maybe<Master_Config>;
  /** An array relationship */
  master_configs: Array<Master_Config>;
  /** An aggregate relationship */
  master_configs_aggregate: Master_Config_Aggregate;
  parent_code?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "master_config" */
export type Master_ConfigMaster_ConfigsArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


/** columns and relationships of "master_config" */
export type Master_ConfigMaster_Configs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};

/** aggregated selection of "master_config" */
export type Master_Config_Aggregate = {
  aggregate?: Maybe<Master_Config_Aggregate_Fields>;
  nodes: Array<Master_Config>;
};

export type Master_Config_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Master_Config_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Master_Config_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Master_Config_Aggregate_Bool_Exp_Count>;
};

export type Master_Config_Aggregate_Bool_Exp_Bool_And = {
  arguments: Master_Config_Select_Column_Master_Config_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Config_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Config_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Master_Config_Select_Column_Master_Config_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Config_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Config_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Master_Config_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Config_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "master_config" */
export type Master_Config_Aggregate_Fields = {
  avg?: Maybe<Master_Config_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Config_Max_Fields>;
  min?: Maybe<Master_Config_Min_Fields>;
  stddev?: Maybe<Master_Config_Stddev_Fields>;
  stddev_pop?: Maybe<Master_Config_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Master_Config_Stddev_Samp_Fields>;
  sum?: Maybe<Master_Config_Sum_Fields>;
  var_pop?: Maybe<Master_Config_Var_Pop_Fields>;
  var_samp?: Maybe<Master_Config_Var_Samp_Fields>;
  variance?: Maybe<Master_Config_Variance_Fields>;
};


/** aggregate fields of "master_config" */
export type Master_Config_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Config_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "master_config" */
export type Master_Config_Aggregate_Order_By = {
  avg?: InputMaybe<Master_Config_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Master_Config_Max_Order_By>;
  min?: InputMaybe<Master_Config_Min_Order_By>;
  stddev?: InputMaybe<Master_Config_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Master_Config_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Master_Config_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Master_Config_Sum_Order_By>;
  var_pop?: InputMaybe<Master_Config_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Master_Config_Var_Samp_Order_By>;
  variance?: InputMaybe<Master_Config_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "master_config" */
export type Master_Config_Arr_Rel_Insert_Input = {
  data: Array<Master_Config_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Config_On_Conflict>;
};

/** aggregate avg on columns */
export type Master_Config_Avg_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "master_config" */
export type Master_Config_Avg_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "master_config". All fields are combined with a logical 'AND'. */
export type Master_Config_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Config_Bool_Exp>>;
  _not?: InputMaybe<Master_Config_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Config_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  config_key?: InputMaybe<String_Comparison_Exp>;
  config_type?: InputMaybe<String_Comparison_Exp>;
  config_value?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  master_config?: InputMaybe<Master_Config_Bool_Exp>;
  master_configs?: InputMaybe<Master_Config_Bool_Exp>;
  master_configs_aggregate?: InputMaybe<Master_Config_Aggregate_Bool_Exp>;
  parent_code?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_config" */
export enum Master_Config_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterConfigCodeKey = 'master_config_code_key',
  /** unique or primary key constraint on columns "config_type", "config_key" */
  MasterConfigConfigTypeConfigKeyKey = 'master_config_config_type_config_key_key',
  /** unique or primary key constraint on columns "id" */
  MasterConfigPkey = 'master_config_pkey'
}

/** input type for incrementing numeric columns in table "master_config" */
export type Master_Config_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "master_config" */
export type Master_Config_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_type?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  master_config?: InputMaybe<Master_Config_Obj_Rel_Insert_Input>;
  master_configs?: InputMaybe<Master_Config_Arr_Rel_Insert_Input>;
  parent_code?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Master_Config_Max_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  config_key?: Maybe<Scalars['String']['output']>;
  config_type?: Maybe<Scalars['String']['output']>;
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  parent_code?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "master_config" */
export type Master_Config_Max_Order_By = {
  code?: InputMaybe<Order_By>;
  config_key?: InputMaybe<Order_By>;
  config_type?: InputMaybe<Order_By>;
  config_value?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  parent_code?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Master_Config_Min_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  config_key?: Maybe<Scalars['String']['output']>;
  config_type?: Maybe<Scalars['String']['output']>;
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  parent_code?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "master_config" */
export type Master_Config_Min_Order_By = {
  code?: InputMaybe<Order_By>;
  config_key?: InputMaybe<Order_By>;
  config_type?: InputMaybe<Order_By>;
  config_value?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  parent_code?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "master_config" */
export type Master_Config_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Config>;
};

/** input type for inserting object relation for remote table "master_config" */
export type Master_Config_Obj_Rel_Insert_Input = {
  data: Master_Config_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Config_On_Conflict>;
};

/** on_conflict condition type for table "master_config" */
export type Master_Config_On_Conflict = {
  constraint: Master_Config_Constraint;
  update_columns?: Array<Master_Config_Update_Column>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};

/** Ordering options when selecting data from "master_config". */
export type Master_Config_Order_By = {
  code?: InputMaybe<Order_By>;
  config_key?: InputMaybe<Order_By>;
  config_type?: InputMaybe<Order_By>;
  config_value?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  master_config?: InputMaybe<Master_Config_Order_By>;
  master_configs_aggregate?: InputMaybe<Master_Config_Aggregate_Order_By>;
  parent_code?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_config */
export type Master_Config_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_config" */
export enum Master_Config_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  ConfigKey = 'config_key',
  /** column name */
  ConfigType = 'config_type',
  /** column name */
  ConfigValue = 'config_value',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  ParentCode = 'parent_code',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "master_config_aggregate_bool_exp_bool_and_arguments_columns" columns of table "master_config" */
export enum Master_Config_Select_Column_Master_Config_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "master_config_aggregate_bool_exp_bool_or_arguments_columns" columns of table "master_config" */
export enum Master_Config_Select_Column_Master_Config_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "master_config" */
export type Master_Config_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_type?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  parent_code?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Master_Config_Stddev_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "master_config" */
export type Master_Config_Stddev_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Master_Config_Stddev_Pop_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "master_config" */
export type Master_Config_Stddev_Pop_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Master_Config_Stddev_Samp_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "master_config" */
export type Master_Config_Stddev_Samp_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "master_config" */
export type Master_Config_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Config_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Config_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_type?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  parent_code?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Master_Config_Sum_Fields = {
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "master_config" */
export type Master_Config_Sum_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** update columns of table "master_config" */
export enum Master_Config_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  ConfigKey = 'config_key',
  /** column name */
  ConfigType = 'config_type',
  /** column name */
  ConfigValue = 'config_value',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  ParentCode = 'parent_code',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Master_Config_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Master_Config_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Config_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Config_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Master_Config_Var_Pop_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "master_config" */
export type Master_Config_Var_Pop_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Master_Config_Var_Samp_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "master_config" */
export type Master_Config_Var_Samp_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Master_Config_Variance_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "master_config" */
export type Master_Config_Variance_Order_By = {
  sort_order?: InputMaybe<Order_By>;
};

/** columns and relationships of "master_device" */
export type Master_Device = {
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  device_name: Scalars['String']['output'];
  device_type_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  ip_address?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  mac_address?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  master_device_type: Master_Device_Type;
  model?: Maybe<Scalars['String']['output']>;
  serial_number?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  transact_session_sources: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transact_session_sources_aggregate: Transact_Session_Source_Aggregate;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "master_device" */
export type Master_DeviceTransact_Session_SourcesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** columns and relationships of "master_device" */
export type Master_DeviceTransact_Session_Sources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};

/** aggregated selection of "master_device" */
export type Master_Device_Aggregate = {
  aggregate?: Maybe<Master_Device_Aggregate_Fields>;
  nodes: Array<Master_Device>;
};

export type Master_Device_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Master_Device_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Master_Device_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Master_Device_Aggregate_Bool_Exp_Count>;
};

export type Master_Device_Aggregate_Bool_Exp_Bool_And = {
  arguments: Master_Device_Select_Column_Master_Device_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Device_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Device_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Master_Device_Select_Column_Master_Device_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Device_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Device_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Master_Device_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Device_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "master_device" */
export type Master_Device_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Device_Max_Fields>;
  min?: Maybe<Master_Device_Min_Fields>;
};


/** aggregate fields of "master_device" */
export type Master_Device_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Device_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "master_device" */
export type Master_Device_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Master_Device_Max_Order_By>;
  min?: InputMaybe<Master_Device_Min_Order_By>;
};

/** input type for inserting array relation for remote table "master_device" */
export type Master_Device_Arr_Rel_Insert_Input = {
  data: Array<Master_Device_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Device_On_Conflict>;
};

/** Boolean expression to filter rows from the table "master_device". All fields are combined with a logical 'AND'. */
export type Master_Device_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Device_Bool_Exp>>;
  _not?: InputMaybe<Master_Device_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Device_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  device_name?: InputMaybe<String_Comparison_Exp>;
  device_type_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  ip_address?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  location?: InputMaybe<String_Comparison_Exp>;
  mac_address?: InputMaybe<String_Comparison_Exp>;
  master_device_type?: InputMaybe<Master_Device_Type_Bool_Exp>;
  model?: InputMaybe<String_Comparison_Exp>;
  serial_number?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_device" */
export enum Master_Device_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterDeviceCodeKey = 'master_device_code_key',
  /** unique or primary key constraint on columns "id" */
  MasterDevicePkey = 'master_device_pkey'
}

/** input type for inserting data into table "master_device" */
export type Master_Device_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  device_name?: InputMaybe<Scalars['String']['input']>;
  device_type_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  mac_address?: InputMaybe<Scalars['String']['input']>;
  master_device_type?: InputMaybe<Master_Device_Type_Obj_Rel_Insert_Input>;
  model?: InputMaybe<Scalars['String']['input']>;
  serial_number?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Master_Device_Max_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  device_name?: Maybe<Scalars['String']['output']>;
  device_type_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  mac_address?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  serial_number?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "master_device" */
export type Master_Device_Max_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  device_name?: InputMaybe<Order_By>;
  device_type_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  mac_address?: InputMaybe<Order_By>;
  model?: InputMaybe<Order_By>;
  serial_number?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Master_Device_Min_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  device_name?: Maybe<Scalars['String']['output']>;
  device_type_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  mac_address?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  serial_number?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "master_device" */
export type Master_Device_Min_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  device_name?: InputMaybe<Order_By>;
  device_type_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  mac_address?: InputMaybe<Order_By>;
  model?: InputMaybe<Order_By>;
  serial_number?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "master_device" */
export type Master_Device_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Device>;
};

/** input type for inserting object relation for remote table "master_device" */
export type Master_Device_Obj_Rel_Insert_Input = {
  data: Master_Device_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Device_On_Conflict>;
};

/** on_conflict condition type for table "master_device" */
export type Master_Device_On_Conflict = {
  constraint: Master_Device_Constraint;
  update_columns?: Array<Master_Device_Update_Column>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};

/** Ordering options when selecting data from "master_device". */
export type Master_Device_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  device_name?: InputMaybe<Order_By>;
  device_type_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  mac_address?: InputMaybe<Order_By>;
  master_device_type?: InputMaybe<Master_Device_Type_Order_By>;
  model?: InputMaybe<Order_By>;
  serial_number?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_device */
export type Master_Device_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_device" */
export enum Master_Device_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  DeviceName = 'device_name',
  /** column name */
  DeviceTypeId = 'device_type_id',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Location = 'location',
  /** column name */
  MacAddress = 'mac_address',
  /** column name */
  Model = 'model',
  /** column name */
  SerialNumber = 'serial_number',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "master_device_aggregate_bool_exp_bool_and_arguments_columns" columns of table "master_device" */
export enum Master_Device_Select_Column_Master_Device_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "master_device_aggregate_bool_exp_bool_or_arguments_columns" columns of table "master_device" */
export enum Master_Device_Select_Column_Master_Device_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "master_device" */
export type Master_Device_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  device_name?: InputMaybe<Scalars['String']['input']>;
  device_type_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  mac_address?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  serial_number?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "master_device" */
export type Master_Device_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Device_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Device_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  device_name?: InputMaybe<Scalars['String']['input']>;
  device_type_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  mac_address?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  serial_number?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** columns and relationships of "master_device_type" */
export type Master_Device_Type = {
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An array relationship */
  master_devices: Array<Master_Device>;
  /** An aggregate relationship */
  master_devices_aggregate: Master_Device_Aggregate;
  type_name: Scalars['String']['output'];
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "master_device_type" */
export type Master_Device_TypeMaster_DevicesArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


/** columns and relationships of "master_device_type" */
export type Master_Device_TypeMaster_Devices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};

/** aggregated selection of "master_device_type" */
export type Master_Device_Type_Aggregate = {
  aggregate?: Maybe<Master_Device_Type_Aggregate_Fields>;
  nodes: Array<Master_Device_Type>;
};

/** aggregate fields of "master_device_type" */
export type Master_Device_Type_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Device_Type_Max_Fields>;
  min?: Maybe<Master_Device_Type_Min_Fields>;
};


/** aggregate fields of "master_device_type" */
export type Master_Device_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Device_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "master_device_type". All fields are combined with a logical 'AND'. */
export type Master_Device_Type_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Device_Type_Bool_Exp>>;
  _not?: InputMaybe<Master_Device_Type_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Device_Type_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  master_devices?: InputMaybe<Master_Device_Bool_Exp>;
  master_devices_aggregate?: InputMaybe<Master_Device_Aggregate_Bool_Exp>;
  type_name?: InputMaybe<String_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_device_type" */
export enum Master_Device_Type_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterDeviceTypeCodeKey = 'master_device_type_code_key',
  /** unique or primary key constraint on columns "id" */
  MasterDeviceTypePkey = 'master_device_type_pkey'
}

/** input type for inserting data into table "master_device_type" */
export type Master_Device_Type_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  master_devices?: InputMaybe<Master_Device_Arr_Rel_Insert_Input>;
  type_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Master_Device_Type_Max_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  type_name?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Master_Device_Type_Min_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  type_name?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "master_device_type" */
export type Master_Device_Type_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Device_Type>;
};

/** input type for inserting object relation for remote table "master_device_type" */
export type Master_Device_Type_Obj_Rel_Insert_Input = {
  data: Master_Device_Type_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Device_Type_On_Conflict>;
};

/** on_conflict condition type for table "master_device_type" */
export type Master_Device_Type_On_Conflict = {
  constraint: Master_Device_Type_Constraint;
  update_columns?: Array<Master_Device_Type_Update_Column>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};

/** Ordering options when selecting data from "master_device_type". */
export type Master_Device_Type_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  master_devices_aggregate?: InputMaybe<Master_Device_Aggregate_Order_By>;
  type_name?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_device_type */
export type Master_Device_Type_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_device_type" */
export enum Master_Device_Type_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  TypeName = 'type_name',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** input type for updating data in table "master_device_type" */
export type Master_Device_Type_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  type_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "master_device_type" */
export type Master_Device_Type_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Device_Type_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Device_Type_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  type_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "master_device_type" */
export enum Master_Device_Type_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  TypeName = 'type_name',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Master_Device_Type_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Device_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Device_Type_Bool_Exp;
};

/** update columns of table "master_device" */
export enum Master_Device_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  DeviceName = 'device_name',
  /** column name */
  DeviceTypeId = 'device_type_id',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Location = 'location',
  /** column name */
  MacAddress = 'mac_address',
  /** column name */
  Model = 'model',
  /** column name */
  SerialNumber = 'serial_number',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Master_Device_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Device_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Device_Bool_Exp;
};

/** columns and relationships of "master_role" */
export type Master_Role = {
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An array relationship */
  master_users: Array<Master_User>;
  /** An aggregate relationship */
  master_users_aggregate: Master_User_Aggregate;
  role_name: Scalars['String']['output'];
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "master_role" */
export type Master_RoleMaster_UsersArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


/** columns and relationships of "master_role" */
export type Master_RoleMaster_Users_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};

/** aggregated selection of "master_role" */
export type Master_Role_Aggregate = {
  aggregate?: Maybe<Master_Role_Aggregate_Fields>;
  nodes: Array<Master_Role>;
};

/** aggregate fields of "master_role" */
export type Master_Role_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Role_Max_Fields>;
  min?: Maybe<Master_Role_Min_Fields>;
};


/** aggregate fields of "master_role" */
export type Master_Role_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Role_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "master_role". All fields are combined with a logical 'AND'. */
export type Master_Role_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Role_Bool_Exp>>;
  _not?: InputMaybe<Master_Role_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Role_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  master_users?: InputMaybe<Master_User_Bool_Exp>;
  master_users_aggregate?: InputMaybe<Master_User_Aggregate_Bool_Exp>;
  role_name?: InputMaybe<String_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_role" */
export enum Master_Role_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterRoleCodeKey = 'master_role_code_key',
  /** unique or primary key constraint on columns "id" */
  MasterRolePkey = 'master_role_pkey'
}

/** input type for inserting data into table "master_role" */
export type Master_Role_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  master_users?: InputMaybe<Master_User_Arr_Rel_Insert_Input>;
  role_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Master_Role_Max_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  role_name?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Master_Role_Min_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  role_name?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "master_role" */
export type Master_Role_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Role>;
};

/** input type for inserting object relation for remote table "master_role" */
export type Master_Role_Obj_Rel_Insert_Input = {
  data: Master_Role_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Role_On_Conflict>;
};

/** on_conflict condition type for table "master_role" */
export type Master_Role_On_Conflict = {
  constraint: Master_Role_Constraint;
  update_columns?: Array<Master_Role_Update_Column>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};

/** Ordering options when selecting data from "master_role". */
export type Master_Role_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  master_users_aggregate?: InputMaybe<Master_User_Aggregate_Order_By>;
  role_name?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_role */
export type Master_Role_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_role" */
export enum Master_Role_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  RoleName = 'role_name',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** input type for updating data in table "master_role" */
export type Master_Role_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  role_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "master_role" */
export type Master_Role_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Role_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Role_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  role_name?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "master_role" */
export enum Master_Role_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  RoleName = 'role_name',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Master_Role_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Role_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Role_Bool_Exp;
};

/** Master data for all sites in the multi-site architecture */
export type Master_Site = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: Maybe<Scalars['uuid']['output']>;
  active_operator_name?: Maybe<Scalars['String']['output']>;
  app_version?: Maybe<Scalars['String']['output']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code: Scalars['String']['output'];
  contact_name?: Maybe<Scalars['String']['output']>;
  contact_phone?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['numeric']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['numeric']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  /** Latest site runtime status reported by the local site */
  operational_status: Scalars['String']['output'];
  service_version?: Maybe<Scalars['String']['output']>;
  site_address?: Maybe<Scalars['String']['output']>;
  site_city?: Maybe<Scalars['String']['output']>;
  site_location?: Maybe<Scalars['String']['output']>;
  site_name: Scalars['String']['output'];
  site_province?: Maybe<Scalars['String']['output']>;
  /** Region/area of the site for grouping */
  site_region?: Maybe<Scalars['String']['output']>;
  site_timezone: Scalars['String']['output'];
  /** An array relationship */
  transact_anpr_captures: Array<Transact_Anpr_Capture>;
  /** An aggregate relationship */
  transact_anpr_captures_aggregate: Transact_Anpr_Capture_Aggregate;
  /** An array relationship */
  transact_axle_captures: Array<Transact_Axle_Capture>;
  /** An aggregate relationship */
  transact_axle_captures_aggregate: Transact_Axle_Capture_Aggregate;
  /** An array relationship */
  transact_cctvs: Array<Transact_Cctv>;
  /** An aggregate relationship */
  transact_cctvs_aggregate: Transact_Cctv_Aggregate;
  /** An array relationship */
  transact_dimensions: Array<Transact_Dimension>;
  /** An aggregate relationship */
  transact_dimensions_aggregate: Transact_Dimension_Aggregate;
  /** An array relationship */
  transact_session_sources: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transact_session_sources_aggregate: Transact_Session_Source_Aggregate;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An array relationship */
  transact_vehicle_revisions: Array<Transact_Vehicle_Revision>;
  /** An aggregate relationship */
  transact_vehicle_revisions_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** An array relationship */
  transact_vehicle_statuses: Array<Transact_Vehicle_Status>;
  /** An aggregate relationship */
  transact_vehicle_statuses_aggregate: Transact_Vehicle_Status_Aggregate;
  /** An array relationship */
  transact_weighings: Array<Transact_Weighing>;
  /** An aggregate relationship */
  transact_weighings_aggregate: Transact_Weighing_Aggregate;
  /** An array relationship */
  transact_wim_sessions: Array<Transact_Wim_Session>;
  /** An aggregate relationship */
  transact_wim_sessions_aggregate: Transact_Wim_Session_Aggregate;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Anpr_CapturesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Anpr_Captures_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Axle_CapturesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Axle_Captures_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_CctvsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Cctvs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_DimensionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Dimensions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Session_SourcesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Session_Sources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_RevisionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_Revisions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_StatusesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Vehicle_Statuses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_WeighingsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Weighings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Wim_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


/** Master data for all sites in the multi-site architecture */
export type Master_SiteTransact_Wim_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};

/** aggregated selection of "master_site" */
export type Master_Site_Aggregate = {
  aggregate?: Maybe<Master_Site_Aggregate_Fields>;
  nodes: Array<Master_Site>;
};

export type Master_Site_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Master_Site_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Master_Site_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Master_Site_Aggregate_Bool_Exp_Count>;
};

export type Master_Site_Aggregate_Bool_Exp_Bool_And = {
  arguments: Master_Site_Select_Column_Master_Site_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Site_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Site_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Master_Site_Select_Column_Master_Site_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Site_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Site_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Master_Site_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Site_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "master_site" */
export type Master_Site_Aggregate_Fields = {
  avg?: Maybe<Master_Site_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Site_Max_Fields>;
  min?: Maybe<Master_Site_Min_Fields>;
  stddev?: Maybe<Master_Site_Stddev_Fields>;
  stddev_pop?: Maybe<Master_Site_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Master_Site_Stddev_Samp_Fields>;
  sum?: Maybe<Master_Site_Sum_Fields>;
  var_pop?: Maybe<Master_Site_Var_Pop_Fields>;
  var_samp?: Maybe<Master_Site_Var_Samp_Fields>;
  variance?: Maybe<Master_Site_Variance_Fields>;
};


/** aggregate fields of "master_site" */
export type Master_Site_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Site_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "master_site" */
export type Master_Site_Aggregate_Order_By = {
  avg?: InputMaybe<Master_Site_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Master_Site_Max_Order_By>;
  min?: InputMaybe<Master_Site_Min_Order_By>;
  stddev?: InputMaybe<Master_Site_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Master_Site_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Master_Site_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Master_Site_Sum_Order_By>;
  var_pop?: InputMaybe<Master_Site_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Master_Site_Var_Samp_Order_By>;
  variance?: InputMaybe<Master_Site_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "master_site" */
export type Master_Site_Arr_Rel_Insert_Input = {
  data: Array<Master_Site_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Site_On_Conflict>;
};

/** aggregate avg on columns */
export type Master_Site_Avg_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "master_site" */
export type Master_Site_Avg_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "master_site". All fields are combined with a logical 'AND'. */
export type Master_Site_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Site_Bool_Exp>>;
  _not?: InputMaybe<Master_Site_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Site_Bool_Exp>>;
  active_operator_id?: InputMaybe<Uuid_Comparison_Exp>;
  active_operator_name?: InputMaybe<String_Comparison_Exp>;
  app_version?: InputMaybe<String_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  contact_name?: InputMaybe<String_Comparison_Exp>;
  contact_phone?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  default_latitude?: InputMaybe<Numeric_Comparison_Exp>;
  default_longitude?: InputMaybe<Numeric_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  last_seen_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  last_sync_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  operational_status?: InputMaybe<String_Comparison_Exp>;
  service_version?: InputMaybe<String_Comparison_Exp>;
  site_address?: InputMaybe<String_Comparison_Exp>;
  site_city?: InputMaybe<String_Comparison_Exp>;
  site_location?: InputMaybe<String_Comparison_Exp>;
  site_name?: InputMaybe<String_Comparison_Exp>;
  site_province?: InputMaybe<String_Comparison_Exp>;
  site_region?: InputMaybe<String_Comparison_Exp>;
  site_timezone?: InputMaybe<String_Comparison_Exp>;
  transact_anpr_captures?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  transact_anpr_captures_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp>;
  transact_axle_captures?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  transact_axle_captures_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp>;
  transact_cctvs?: InputMaybe<Transact_Cctv_Bool_Exp>;
  transact_cctvs_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Bool_Exp>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Bool_Exp>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp>;
  transact_weighings?: InputMaybe<Transact_Weighing_Bool_Exp>;
  transact_weighings_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp>;
  transact_wim_sessions?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_wim_sessions_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_site" */
export enum Master_Site_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterSiteCodeKey = 'master_site_code_key',
  /** unique or primary key constraint on columns "id" */
  MasterSitePkey = 'master_site_pkey'
}

/** input type for incrementing numeric columns in table "master_site" */
export type Master_Site_Inc_Input = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Scalars['numeric']['input']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "master_site" */
export type Master_Site_Insert_Input = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: InputMaybe<Scalars['uuid']['input']>;
  active_operator_name?: InputMaybe<Scalars['String']['input']>;
  app_version?: InputMaybe<Scalars['String']['input']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: InputMaybe<Scalars['String']['input']>;
  contact_name?: InputMaybe<Scalars['String']['input']>;
  contact_phone?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Scalars['numeric']['input']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Scalars['numeric']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: InputMaybe<Scalars['timestamptz']['input']>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  /** Latest site runtime status reported by the local site */
  operational_status?: InputMaybe<Scalars['String']['input']>;
  service_version?: InputMaybe<Scalars['String']['input']>;
  site_address?: InputMaybe<Scalars['String']['input']>;
  site_city?: InputMaybe<Scalars['String']['input']>;
  site_location?: InputMaybe<Scalars['String']['input']>;
  site_name?: InputMaybe<Scalars['String']['input']>;
  site_province?: InputMaybe<Scalars['String']['input']>;
  /** Region/area of the site for grouping */
  site_region?: InputMaybe<Scalars['String']['input']>;
  site_timezone?: InputMaybe<Scalars['String']['input']>;
  transact_anpr_captures?: InputMaybe<Transact_Anpr_Capture_Arr_Rel_Insert_Input>;
  transact_axle_captures?: InputMaybe<Transact_Axle_Capture_Arr_Rel_Insert_Input>;
  transact_cctvs?: InputMaybe<Transact_Cctv_Arr_Rel_Insert_Input>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Arr_Rel_Insert_Input>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Arr_Rel_Insert_Input>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Arr_Rel_Insert_Input>;
  transact_weighings?: InputMaybe<Transact_Weighing_Arr_Rel_Insert_Input>;
  transact_wim_sessions?: InputMaybe<Transact_Wim_Session_Arr_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Master_Site_Max_Fields = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: Maybe<Scalars['uuid']['output']>;
  active_operator_name?: Maybe<Scalars['String']['output']>;
  app_version?: Maybe<Scalars['String']['output']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: Maybe<Scalars['String']['output']>;
  contact_name?: Maybe<Scalars['String']['output']>;
  contact_phone?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['numeric']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['numeric']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Latest site runtime status reported by the local site */
  operational_status?: Maybe<Scalars['String']['output']>;
  service_version?: Maybe<Scalars['String']['output']>;
  site_address?: Maybe<Scalars['String']['output']>;
  site_city?: Maybe<Scalars['String']['output']>;
  site_location?: Maybe<Scalars['String']['output']>;
  site_name?: Maybe<Scalars['String']['output']>;
  site_province?: Maybe<Scalars['String']['output']>;
  /** Region/area of the site for grouping */
  site_region?: Maybe<Scalars['String']['output']>;
  site_timezone?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "master_site" */
export type Master_Site_Max_Order_By = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: InputMaybe<Order_By>;
  active_operator_name?: InputMaybe<Order_By>;
  app_version?: InputMaybe<Order_By>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: InputMaybe<Order_By>;
  contact_name?: InputMaybe<Order_By>;
  contact_phone?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: InputMaybe<Order_By>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: InputMaybe<Order_By>;
  /** Latest site runtime status reported by the local site */
  operational_status?: InputMaybe<Order_By>;
  service_version?: InputMaybe<Order_By>;
  site_address?: InputMaybe<Order_By>;
  site_city?: InputMaybe<Order_By>;
  site_location?: InputMaybe<Order_By>;
  site_name?: InputMaybe<Order_By>;
  site_province?: InputMaybe<Order_By>;
  /** Region/area of the site for grouping */
  site_region?: InputMaybe<Order_By>;
  site_timezone?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Master_Site_Min_Fields = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: Maybe<Scalars['uuid']['output']>;
  active_operator_name?: Maybe<Scalars['String']['output']>;
  app_version?: Maybe<Scalars['String']['output']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: Maybe<Scalars['String']['output']>;
  contact_name?: Maybe<Scalars['String']['output']>;
  contact_phone?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['numeric']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['numeric']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Latest site runtime status reported by the local site */
  operational_status?: Maybe<Scalars['String']['output']>;
  service_version?: Maybe<Scalars['String']['output']>;
  site_address?: Maybe<Scalars['String']['output']>;
  site_city?: Maybe<Scalars['String']['output']>;
  site_location?: Maybe<Scalars['String']['output']>;
  site_name?: Maybe<Scalars['String']['output']>;
  site_province?: Maybe<Scalars['String']['output']>;
  /** Region/area of the site for grouping */
  site_region?: Maybe<Scalars['String']['output']>;
  site_timezone?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "master_site" */
export type Master_Site_Min_Order_By = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: InputMaybe<Order_By>;
  active_operator_name?: InputMaybe<Order_By>;
  app_version?: InputMaybe<Order_By>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: InputMaybe<Order_By>;
  contact_name?: InputMaybe<Order_By>;
  contact_phone?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: InputMaybe<Order_By>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: InputMaybe<Order_By>;
  /** Latest site runtime status reported by the local site */
  operational_status?: InputMaybe<Order_By>;
  service_version?: InputMaybe<Order_By>;
  site_address?: InputMaybe<Order_By>;
  site_city?: InputMaybe<Order_By>;
  site_location?: InputMaybe<Order_By>;
  site_name?: InputMaybe<Order_By>;
  site_province?: InputMaybe<Order_By>;
  /** Region/area of the site for grouping */
  site_region?: InputMaybe<Order_By>;
  site_timezone?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "master_site" */
export type Master_Site_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Site>;
};

/** input type for inserting object relation for remote table "master_site" */
export type Master_Site_Obj_Rel_Insert_Input = {
  data: Master_Site_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Site_On_Conflict>;
};

/** on_conflict condition type for table "master_site" */
export type Master_Site_On_Conflict = {
  constraint: Master_Site_Constraint;
  update_columns?: Array<Master_Site_Update_Column>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};

/** Ordering options when selecting data from "master_site". */
export type Master_Site_Order_By = {
  active_operator_id?: InputMaybe<Order_By>;
  active_operator_name?: InputMaybe<Order_By>;
  app_version?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  contact_name?: InputMaybe<Order_By>;
  contact_phone?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  default_latitude?: InputMaybe<Order_By>;
  default_longitude?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  last_seen_at?: InputMaybe<Order_By>;
  last_sync_at?: InputMaybe<Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  operational_status?: InputMaybe<Order_By>;
  service_version?: InputMaybe<Order_By>;
  site_address?: InputMaybe<Order_By>;
  site_city?: InputMaybe<Order_By>;
  site_location?: InputMaybe<Order_By>;
  site_name?: InputMaybe<Order_By>;
  site_province?: InputMaybe<Order_By>;
  site_region?: InputMaybe<Order_By>;
  site_timezone?: InputMaybe<Order_By>;
  transact_anpr_captures_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Order_By>;
  transact_axle_captures_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Order_By>;
  transact_cctvs_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Order_By>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Order_By>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Order_By>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Order_By>;
  transact_weighings_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Order_By>;
  transact_wim_sessions_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_site */
export type Master_Site_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_site" */
export enum Master_Site_Select_Column {
  /** column name */
  ActiveOperatorId = 'active_operator_id',
  /** column name */
  ActiveOperatorName = 'active_operator_name',
  /** column name */
  AppVersion = 'app_version',
  /** column name */
  Code = 'code',
  /** column name */
  ContactName = 'contact_name',
  /** column name */
  ContactPhone = 'contact_phone',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DefaultLatitude = 'default_latitude',
  /** column name */
  DefaultLongitude = 'default_longitude',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LastSeenAt = 'last_seen_at',
  /** column name */
  LastSyncAt = 'last_sync_at',
  /** column name */
  OperationalStatus = 'operational_status',
  /** column name */
  ServiceVersion = 'service_version',
  /** column name */
  SiteAddress = 'site_address',
  /** column name */
  SiteCity = 'site_city',
  /** column name */
  SiteLocation = 'site_location',
  /** column name */
  SiteName = 'site_name',
  /** column name */
  SiteProvince = 'site_province',
  /** column name */
  SiteRegion = 'site_region',
  /** column name */
  SiteTimezone = 'site_timezone',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "master_site_aggregate_bool_exp_bool_and_arguments_columns" columns of table "master_site" */
export enum Master_Site_Select_Column_Master_Site_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "master_site_aggregate_bool_exp_bool_or_arguments_columns" columns of table "master_site" */
export enum Master_Site_Select_Column_Master_Site_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "master_site" */
export type Master_Site_Set_Input = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: InputMaybe<Scalars['uuid']['input']>;
  active_operator_name?: InputMaybe<Scalars['String']['input']>;
  app_version?: InputMaybe<Scalars['String']['input']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: InputMaybe<Scalars['String']['input']>;
  contact_name?: InputMaybe<Scalars['String']['input']>;
  contact_phone?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Scalars['numeric']['input']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Scalars['numeric']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Latest site runtime status reported by the local site */
  operational_status?: InputMaybe<Scalars['String']['input']>;
  service_version?: InputMaybe<Scalars['String']['input']>;
  site_address?: InputMaybe<Scalars['String']['input']>;
  site_city?: InputMaybe<Scalars['String']['input']>;
  site_location?: InputMaybe<Scalars['String']['input']>;
  site_name?: InputMaybe<Scalars['String']['input']>;
  site_province?: InputMaybe<Scalars['String']['input']>;
  /** Region/area of the site for grouping */
  site_region?: InputMaybe<Scalars['String']['input']>;
  site_timezone?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Master_Site_Stddev_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "master_site" */
export type Master_Site_Stddev_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Master_Site_Stddev_Pop_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "master_site" */
export type Master_Site_Stddev_Pop_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Master_Site_Stddev_Samp_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "master_site" */
export type Master_Site_Stddev_Samp_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "master_site" */
export type Master_Site_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Site_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Site_Stream_Cursor_Value_Input = {
  /** Currently active local operator, if reported by the site runtime heartbeat */
  active_operator_id?: InputMaybe<Scalars['uuid']['input']>;
  active_operator_name?: InputMaybe<Scalars['String']['input']>;
  app_version?: InputMaybe<Scalars['String']['input']>;
  /** Unique site code identifier (e.g., SITE001, JKT-TOLL-01) */
  code?: InputMaybe<Scalars['String']['input']>;
  contact_name?: InputMaybe<Scalars['String']['input']>;
  contact_phone?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Scalars['numeric']['input']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Scalars['numeric']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** Latest heartbeat timestamp from this site */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Latest successful sync timestamp from this site */
  last_sync_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Latest site runtime status reported by the local site */
  operational_status?: InputMaybe<Scalars['String']['input']>;
  service_version?: InputMaybe<Scalars['String']['input']>;
  site_address?: InputMaybe<Scalars['String']['input']>;
  site_city?: InputMaybe<Scalars['String']['input']>;
  site_location?: InputMaybe<Scalars['String']['input']>;
  site_name?: InputMaybe<Scalars['String']['input']>;
  site_province?: InputMaybe<Scalars['String']['input']>;
  /** Region/area of the site for grouping */
  site_region?: InputMaybe<Scalars['String']['input']>;
  site_timezone?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Master_Site_Sum_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['numeric']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "master_site" */
export type Master_Site_Sum_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** update columns of table "master_site" */
export enum Master_Site_Update_Column {
  /** column name */
  ActiveOperatorId = 'active_operator_id',
  /** column name */
  ActiveOperatorName = 'active_operator_name',
  /** column name */
  AppVersion = 'app_version',
  /** column name */
  Code = 'code',
  /** column name */
  ContactName = 'contact_name',
  /** column name */
  ContactPhone = 'contact_phone',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DefaultLatitude = 'default_latitude',
  /** column name */
  DefaultLongitude = 'default_longitude',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LastSeenAt = 'last_seen_at',
  /** column name */
  LastSyncAt = 'last_sync_at',
  /** column name */
  OperationalStatus = 'operational_status',
  /** column name */
  ServiceVersion = 'service_version',
  /** column name */
  SiteAddress = 'site_address',
  /** column name */
  SiteCity = 'site_city',
  /** column name */
  SiteLocation = 'site_location',
  /** column name */
  SiteName = 'site_name',
  /** column name */
  SiteProvince = 'site_province',
  /** column name */
  SiteRegion = 'site_region',
  /** column name */
  SiteTimezone = 'site_timezone',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Master_Site_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Master_Site_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Site_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Site_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Master_Site_Var_Pop_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "master_site" */
export type Master_Site_Var_Pop_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Master_Site_Var_Samp_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "master_site" */
export type Master_Site_Var_Samp_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Master_Site_Variance_Fields = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: Maybe<Scalars['Float']['output']>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "master_site" */
export type Master_Site_Variance_Order_By = {
  /** Configured fallback latitude used when mobile enforcement GPS is unavailable. */
  default_latitude?: InputMaybe<Order_By>;
  /** Configured fallback longitude used when mobile enforcement GPS is unavailable. */
  default_longitude?: InputMaybe<Order_By>;
};

/** columns and relationships of "master_user" */
export type Master_User = {
  badge_no?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  full_name: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  masterUserByUpdatedBy?: Maybe<Master_User>;
  /** An array relationship */
  masterUsersByUpdatedBy: Array<Master_User>;
  /** An aggregate relationship */
  masterUsersByUpdatedBy_aggregate: Master_User_Aggregate;
  /** An array relationship */
  masterVehicleClassesByUpdatedBy: Array<Master_Vehicle_Class>;
  /** An aggregate relationship */
  masterVehicleClassesByUpdatedBy_aggregate: Master_Vehicle_Class_Aggregate;
  /** An object relationship */
  master_role: Master_Role;
  /** An array relationship */
  master_sites: Array<Master_Site>;
  /** An aggregate relationship */
  master_sites_aggregate: Master_Site_Aggregate;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  /** An array relationship */
  master_users: Array<Master_User>;
  /** An aggregate relationship */
  master_users_aggregate: Master_User_Aggregate;
  /** An array relationship */
  master_vehicle_classes: Array<Master_Vehicle_Class>;
  /** An aggregate relationship */
  master_vehicle_classes_aggregate: Master_Vehicle_Class_Aggregate;
  password_hash: Scalars['String']['output'];
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_picture?: Maybe<Scalars['String']['output']>;
  role_id: Scalars['uuid']['output'];
  /** An array relationship */
  transactSessionSourcesByUpdatedBy: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transactSessionSourcesByUpdatedBy_aggregate: Transact_Session_Source_Aggregate;
  /** An array relationship */
  transactVehicleStatusesByUpdatedBy: Array<Transact_Vehicle_Status>;
  /** An aggregate relationship */
  transactVehicleStatusesByUpdatedBy_aggregate: Transact_Vehicle_Status_Aggregate;
  /** An array relationship */
  transactWimSessionsByStartedBy: Array<Transact_Wim_Session>;
  /** An aggregate relationship */
  transactWimSessionsByStartedBy_aggregate: Transact_Wim_Session_Aggregate;
  /** An array relationship */
  transact_session_sources: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transact_session_sources_aggregate: Transact_Session_Source_Aggregate;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An array relationship */
  transact_vehicle_revisions: Array<Transact_Vehicle_Revision>;
  /** An aggregate relationship */
  transact_vehicle_revisions_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** An array relationship */
  transact_vehicle_statuses: Array<Transact_Vehicle_Status>;
  /** An aggregate relationship */
  transact_vehicle_statuses_aggregate: Transact_Vehicle_Status_Aggregate;
  /** An array relationship */
  transact_wim_sessions: Array<Transact_Wim_Session>;
  /** An aggregate relationship */
  transact_wim_sessions_aggregate: Transact_Wim_Session_Aggregate;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  user_login_histories: Array<User_Login_History>;
  /** An aggregate relationship */
  user_login_histories_aggregate: User_Login_History_Aggregate;
  username: Scalars['String']['output'];
};


/** columns and relationships of "master_user" */
export type Master_UserMasterUsersByUpdatedByArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMasterUsersByUpdatedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMasterVehicleClassesByUpdatedByArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMasterVehicleClassesByUpdatedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_SitesArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_Sites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_UsersArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_Users_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_Vehicle_ClassesArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserMaster_Vehicle_Classes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactSessionSourcesByUpdatedByArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactSessionSourcesByUpdatedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactVehicleStatusesByUpdatedByArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactVehicleStatusesByUpdatedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactWimSessionsByStartedByArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransactWimSessionsByStartedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Session_SourcesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Session_Sources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_RevisionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_Revisions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_StatusesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Vehicle_Statuses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Wim_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserTransact_Wim_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserUser_Login_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


/** columns and relationships of "master_user" */
export type Master_UserUser_Login_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};

/** aggregated selection of "master_user" */
export type Master_User_Aggregate = {
  aggregate?: Maybe<Master_User_Aggregate_Fields>;
  nodes: Array<Master_User>;
};

export type Master_User_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Master_User_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Master_User_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Master_User_Aggregate_Bool_Exp_Count>;
};

export type Master_User_Aggregate_Bool_Exp_Bool_And = {
  arguments: Master_User_Select_Column_Master_User_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_User_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_User_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Master_User_Select_Column_Master_User_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_User_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_User_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Master_User_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_User_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "master_user" */
export type Master_User_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Master_User_Max_Fields>;
  min?: Maybe<Master_User_Min_Fields>;
};


/** aggregate fields of "master_user" */
export type Master_User_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_User_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "master_user" */
export type Master_User_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Master_User_Max_Order_By>;
  min?: InputMaybe<Master_User_Min_Order_By>;
};

/** input type for inserting array relation for remote table "master_user" */
export type Master_User_Arr_Rel_Insert_Input = {
  data: Array<Master_User_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_User_On_Conflict>;
};

/** Boolean expression to filter rows from the table "master_user". All fields are combined with a logical 'AND'. */
export type Master_User_Bool_Exp = {
  _and?: InputMaybe<Array<Master_User_Bool_Exp>>;
  _not?: InputMaybe<Master_User_Bool_Exp>;
  _or?: InputMaybe<Array<Master_User_Bool_Exp>>;
  badge_no?: InputMaybe<String_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  full_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Bool_Exp>;
  masterUsersByUpdatedBy?: InputMaybe<Master_User_Bool_Exp>;
  masterUsersByUpdatedBy_aggregate?: InputMaybe<Master_User_Aggregate_Bool_Exp>;
  masterVehicleClassesByUpdatedBy?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  masterVehicleClassesByUpdatedBy_aggregate?: InputMaybe<Master_Vehicle_Class_Aggregate_Bool_Exp>;
  master_role?: InputMaybe<Master_Role_Bool_Exp>;
  master_sites?: InputMaybe<Master_Site_Bool_Exp>;
  master_sites_aggregate?: InputMaybe<Master_Site_Aggregate_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  master_users?: InputMaybe<Master_User_Bool_Exp>;
  master_users_aggregate?: InputMaybe<Master_User_Aggregate_Bool_Exp>;
  master_vehicle_classes?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  master_vehicle_classes_aggregate?: InputMaybe<Master_Vehicle_Class_Aggregate_Bool_Exp>;
  password_hash?: InputMaybe<String_Comparison_Exp>;
  phone_number?: InputMaybe<String_Comparison_Exp>;
  profile_picture?: InputMaybe<String_Comparison_Exp>;
  role_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactSessionSourcesByUpdatedBy?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transactSessionSourcesByUpdatedBy_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  transactVehicleStatusesByUpdatedBy?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  transactVehicleStatusesByUpdatedBy_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp>;
  transactWimSessionsByStartedBy?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transactWimSessionsByStartedBy_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Bool_Exp>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp>;
  transact_wim_sessions?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_wim_sessions_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_login_histories?: InputMaybe<User_Login_History_Bool_Exp>;
  user_login_histories_aggregate?: InputMaybe<User_Login_History_Aggregate_Bool_Exp>;
  username?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_user" */
export enum Master_User_Constraint {
  /** unique or primary key constraint on columns "code" */
  MasterUserCodeKey = 'master_user_code_key',
  /** unique or primary key constraint on columns "id" */
  MasterUserPkey = 'master_user_pkey',
  /** unique or primary key constraint on columns "username" */
  MasterUserUsernameKey = 'master_user_username_key'
}

/** input type for inserting data into table "master_user" */
export type Master_User_Insert_Input = {
  badge_no?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  masterUsersByUpdatedBy?: InputMaybe<Master_User_Arr_Rel_Insert_Input>;
  masterVehicleClassesByUpdatedBy?: InputMaybe<Master_Vehicle_Class_Arr_Rel_Insert_Input>;
  master_role?: InputMaybe<Master_Role_Obj_Rel_Insert_Input>;
  master_sites?: InputMaybe<Master_Site_Arr_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  master_users?: InputMaybe<Master_User_Arr_Rel_Insert_Input>;
  master_vehicle_classes?: InputMaybe<Master_Vehicle_Class_Arr_Rel_Insert_Input>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  role_id?: InputMaybe<Scalars['uuid']['input']>;
  transactSessionSourcesByUpdatedBy?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  transactVehicleStatusesByUpdatedBy?: InputMaybe<Transact_Vehicle_Status_Arr_Rel_Insert_Input>;
  transactWimSessionsByStartedBy?: InputMaybe<Transact_Wim_Session_Arr_Rel_Insert_Input>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Arr_Rel_Insert_Input>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Arr_Rel_Insert_Input>;
  transact_wim_sessions?: InputMaybe<Transact_Wim_Session_Arr_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  user_login_histories?: InputMaybe<User_Login_History_Arr_Rel_Insert_Input>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Master_User_Max_Fields = {
  badge_no?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  password_hash?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_picture?: Maybe<Scalars['String']['output']>;
  role_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "master_user" */
export type Master_User_Max_Order_By = {
  badge_no?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  full_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  password_hash?: InputMaybe<Order_By>;
  phone_number?: InputMaybe<Order_By>;
  profile_picture?: InputMaybe<Order_By>;
  role_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  username?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Master_User_Min_Fields = {
  badge_no?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  password_hash?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_picture?: Maybe<Scalars['String']['output']>;
  role_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "master_user" */
export type Master_User_Min_Order_By = {
  badge_no?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  full_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  password_hash?: InputMaybe<Order_By>;
  phone_number?: InputMaybe<Order_By>;
  profile_picture?: InputMaybe<Order_By>;
  role_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  username?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "master_user" */
export type Master_User_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_User>;
};

/** input type for inserting object relation for remote table "master_user" */
export type Master_User_Obj_Rel_Insert_Input = {
  data: Master_User_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_User_On_Conflict>;
};

/** on_conflict condition type for table "master_user" */
export type Master_User_On_Conflict = {
  constraint: Master_User_Constraint;
  update_columns?: Array<Master_User_Update_Column>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};

/** Ordering options when selecting data from "master_user". */
export type Master_User_Order_By = {
  badge_no?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  full_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Order_By>;
  masterUsersByUpdatedBy_aggregate?: InputMaybe<Master_User_Aggregate_Order_By>;
  masterVehicleClassesByUpdatedBy_aggregate?: InputMaybe<Master_Vehicle_Class_Aggregate_Order_By>;
  master_role?: InputMaybe<Master_Role_Order_By>;
  master_sites_aggregate?: InputMaybe<Master_Site_Aggregate_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  master_users_aggregate?: InputMaybe<Master_User_Aggregate_Order_By>;
  master_vehicle_classes_aggregate?: InputMaybe<Master_Vehicle_Class_Aggregate_Order_By>;
  password_hash?: InputMaybe<Order_By>;
  phone_number?: InputMaybe<Order_By>;
  profile_picture?: InputMaybe<Order_By>;
  role_id?: InputMaybe<Order_By>;
  transactSessionSourcesByUpdatedBy_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  transactVehicleStatusesByUpdatedBy_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Order_By>;
  transactWimSessionsByStartedBy_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Order_By>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Order_By>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Order_By>;
  transact_wim_sessions_aggregate?: InputMaybe<Transact_Wim_Session_Aggregate_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  user_login_histories_aggregate?: InputMaybe<User_Login_History_Aggregate_Order_By>;
  username?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_user */
export type Master_User_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_user" */
export enum Master_User_Select_Column {
  /** column name */
  BadgeNo = 'badge_no',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Email = 'email',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  PasswordHash = 'password_hash',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  ProfilePicture = 'profile_picture',
  /** column name */
  RoleId = 'role_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Username = 'username'
}

/** select "master_user_aggregate_bool_exp_bool_and_arguments_columns" columns of table "master_user" */
export enum Master_User_Select_Column_Master_User_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "master_user_aggregate_bool_exp_bool_or_arguments_columns" columns of table "master_user" */
export enum Master_User_Select_Column_Master_User_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "master_user" */
export type Master_User_Set_Input = {
  badge_no?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  role_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "master_user" */
export type Master_User_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_User_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_User_Stream_Cursor_Value_Input = {
  badge_no?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  role_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "master_user" */
export enum Master_User_Update_Column {
  /** column name */
  BadgeNo = 'badge_no',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Email = 'email',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  PasswordHash = 'password_hash',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  ProfilePicture = 'profile_picture',
  /** column name */
  RoleId = 'role_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Username = 'username'
}

export type Master_User_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_User_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_User_Bool_Exp;
};

/** columns and relationships of "master_vehicle_class" */
export type Master_Vehicle_Class = {
  class_2_weight: Scalars['numeric']['output'];
  class_3_weight: Scalars['numeric']['output'];
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  height: Scalars['numeric']['output'];
  id: Scalars['uuid']['output'];
  image?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  length: Scalars['numeric']['output'];
  /** An object relationship */
  masterUserByUpdatedBy?: Maybe<Master_User>;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  total_axle: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date: Scalars['timestamptz']['output'];
  width: Scalars['numeric']['output'];
};

/** aggregated selection of "master_vehicle_class" */
export type Master_Vehicle_Class_Aggregate = {
  aggregate?: Maybe<Master_Vehicle_Class_Aggregate_Fields>;
  nodes: Array<Master_Vehicle_Class>;
};

export type Master_Vehicle_Class_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Master_Vehicle_Class_Aggregate_Bool_Exp_Count>;
};

export type Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_And = {
  arguments: Master_Vehicle_Class_Select_Column_Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Master_Vehicle_Class_Select_Column_Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Master_Vehicle_Class_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "master_vehicle_class" */
export type Master_Vehicle_Class_Aggregate_Fields = {
  avg?: Maybe<Master_Vehicle_Class_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Master_Vehicle_Class_Max_Fields>;
  min?: Maybe<Master_Vehicle_Class_Min_Fields>;
  stddev?: Maybe<Master_Vehicle_Class_Stddev_Fields>;
  stddev_pop?: Maybe<Master_Vehicle_Class_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Master_Vehicle_Class_Stddev_Samp_Fields>;
  sum?: Maybe<Master_Vehicle_Class_Sum_Fields>;
  var_pop?: Maybe<Master_Vehicle_Class_Var_Pop_Fields>;
  var_samp?: Maybe<Master_Vehicle_Class_Var_Samp_Fields>;
  variance?: Maybe<Master_Vehicle_Class_Variance_Fields>;
};


/** aggregate fields of "master_vehicle_class" */
export type Master_Vehicle_Class_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "master_vehicle_class" */
export type Master_Vehicle_Class_Aggregate_Order_By = {
  avg?: InputMaybe<Master_Vehicle_Class_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Master_Vehicle_Class_Max_Order_By>;
  min?: InputMaybe<Master_Vehicle_Class_Min_Order_By>;
  stddev?: InputMaybe<Master_Vehicle_Class_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Master_Vehicle_Class_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Master_Vehicle_Class_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Master_Vehicle_Class_Sum_Order_By>;
  var_pop?: InputMaybe<Master_Vehicle_Class_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Master_Vehicle_Class_Var_Samp_Order_By>;
  variance?: InputMaybe<Master_Vehicle_Class_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "master_vehicle_class" */
export type Master_Vehicle_Class_Arr_Rel_Insert_Input = {
  data: Array<Master_Vehicle_Class_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Master_Vehicle_Class_On_Conflict>;
};

/** aggregate avg on columns */
export type Master_Vehicle_Class_Avg_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Avg_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "master_vehicle_class". All fields are combined with a logical 'AND'. */
export type Master_Vehicle_Class_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Vehicle_Class_Bool_Exp>>;
  _not?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Vehicle_Class_Bool_Exp>>;
  class_2_weight?: InputMaybe<Numeric_Comparison_Exp>;
  class_3_weight?: InputMaybe<Numeric_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  height?: InputMaybe<Numeric_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  length?: InputMaybe<Numeric_Comparison_Exp>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  total_axle?: InputMaybe<Int_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  width?: InputMaybe<Numeric_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_vehicle_class" */
export enum Master_Vehicle_Class_Constraint {
  /** unique or primary key constraint on columns "id" */
  MasterVehicleClassPkey = 'master_vehicle_class_pkey',
  /** unique or primary key constraint on columns "code" */
  UqMasterVehicleClassCode = 'uq_master_vehicle_class_code',
  /** unique or primary key constraint on columns "type" */
  UqMasterVehicleClassType = 'uq_master_vehicle_class_type'
}

/** input type for incrementing numeric columns in table "master_vehicle_class" */
export type Master_Vehicle_Class_Inc_Input = {
  class_2_weight?: InputMaybe<Scalars['numeric']['input']>;
  class_3_weight?: InputMaybe<Scalars['numeric']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "master_vehicle_class" */
export type Master_Vehicle_Class_Insert_Input = {
  class_2_weight?: InputMaybe<Scalars['numeric']['input']>;
  class_3_weight?: InputMaybe<Scalars['numeric']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate max on columns */
export type Master_Vehicle_Class_Max_Fields = {
  class_2_weight?: Maybe<Scalars['numeric']['output']>;
  class_3_weight?: Maybe<Scalars['numeric']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  total_axle?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by max() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Max_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Master_Vehicle_Class_Min_Fields = {
  class_2_weight?: Maybe<Scalars['numeric']['output']>;
  class_3_weight?: Maybe<Scalars['numeric']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  total_axle?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by min() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Min_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "master_vehicle_class" */
export type Master_Vehicle_Class_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Vehicle_Class>;
};

/** on_conflict condition type for table "master_vehicle_class" */
export type Master_Vehicle_Class_On_Conflict = {
  constraint: Master_Vehicle_Class_Constraint;
  update_columns?: Array<Master_Vehicle_Class_Update_Column>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};

/** Ordering options when selecting data from "master_vehicle_class". */
export type Master_Vehicle_Class_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  total_axle?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_vehicle_class */
export type Master_Vehicle_Class_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "master_vehicle_class" */
export enum Master_Vehicle_Class_Select_Column {
  /** column name */
  Class_2Weight = 'class_2_weight',
  /** column name */
  Class_3Weight = 'class_3_weight',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Height = 'height',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Length = 'length',
  /** column name */
  TotalAxle = 'total_axle',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Width = 'width'
}

/** select "master_vehicle_class_aggregate_bool_exp_bool_and_arguments_columns" columns of table "master_vehicle_class" */
export enum Master_Vehicle_Class_Select_Column_Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "master_vehicle_class_aggregate_bool_exp_bool_or_arguments_columns" columns of table "master_vehicle_class" */
export enum Master_Vehicle_Class_Select_Column_Master_Vehicle_Class_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "master_vehicle_class" */
export type Master_Vehicle_Class_Set_Input = {
  class_2_weight?: InputMaybe<Scalars['numeric']['input']>;
  class_3_weight?: InputMaybe<Scalars['numeric']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate stddev on columns */
export type Master_Vehicle_Class_Stddev_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Stddev_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Master_Vehicle_Class_Stddev_Pop_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Stddev_Pop_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Master_Vehicle_Class_Stddev_Samp_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Stddev_Samp_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "master_vehicle_class" */
export type Master_Vehicle_Class_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Vehicle_Class_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Vehicle_Class_Stream_Cursor_Value_Input = {
  class_2_weight?: InputMaybe<Scalars['numeric']['input']>;
  class_3_weight?: InputMaybe<Scalars['numeric']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate sum on columns */
export type Master_Vehicle_Class_Sum_Fields = {
  class_2_weight?: Maybe<Scalars['numeric']['output']>;
  class_3_weight?: Maybe<Scalars['numeric']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  total_axle?: Maybe<Scalars['Int']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Sum_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** update columns of table "master_vehicle_class" */
export enum Master_Vehicle_Class_Update_Column {
  /** column name */
  Class_2Weight = 'class_2_weight',
  /** column name */
  Class_3Weight = 'class_3_weight',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Height = 'height',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Length = 'length',
  /** column name */
  TotalAxle = 'total_axle',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Width = 'width'
}

export type Master_Vehicle_Class_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Master_Vehicle_Class_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Vehicle_Class_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Vehicle_Class_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Master_Vehicle_Class_Var_Pop_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Var_Pop_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Master_Vehicle_Class_Var_Samp_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Var_Samp_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Master_Vehicle_Class_Variance_Fields = {
  class_2_weight?: Maybe<Scalars['Float']['output']>;
  class_3_weight?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  total_axle?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "master_vehicle_class" */
export type Master_Vehicle_Class_Variance_Order_By = {
  class_2_weight?: InputMaybe<Order_By>;
  class_3_weight?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** mutation root */
export type Mutation_Root = {
  /** delete data from the table: "master_config" */
  delete_master_config?: Maybe<Master_Config_Mutation_Response>;
  /** delete single row from the table: "master_config" */
  delete_master_config_by_pk?: Maybe<Master_Config>;
  /** delete data from the table: "master_device" */
  delete_master_device?: Maybe<Master_Device_Mutation_Response>;
  /** delete single row from the table: "master_device" */
  delete_master_device_by_pk?: Maybe<Master_Device>;
  /** delete data from the table: "master_device_type" */
  delete_master_device_type?: Maybe<Master_Device_Type_Mutation_Response>;
  /** delete single row from the table: "master_device_type" */
  delete_master_device_type_by_pk?: Maybe<Master_Device_Type>;
  /** delete data from the table: "master_role" */
  delete_master_role?: Maybe<Master_Role_Mutation_Response>;
  /** delete single row from the table: "master_role" */
  delete_master_role_by_pk?: Maybe<Master_Role>;
  /** delete data from the table: "master_site" */
  delete_master_site?: Maybe<Master_Site_Mutation_Response>;
  /** delete single row from the table: "master_site" */
  delete_master_site_by_pk?: Maybe<Master_Site>;
  /** delete data from the table: "master_user" */
  delete_master_user?: Maybe<Master_User_Mutation_Response>;
  /** delete single row from the table: "master_user" */
  delete_master_user_by_pk?: Maybe<Master_User>;
  /** delete data from the table: "master_vehicle_class" */
  delete_master_vehicle_class?: Maybe<Master_Vehicle_Class_Mutation_Response>;
  /** delete single row from the table: "master_vehicle_class" */
  delete_master_vehicle_class_by_pk?: Maybe<Master_Vehicle_Class>;
  /** delete data from the table: "system_runtime_config" */
  delete_system_runtime_config?: Maybe<System_Runtime_Config_Mutation_Response>;
  /** delete single row from the table: "system_runtime_config" */
  delete_system_runtime_config_by_pk?: Maybe<System_Runtime_Config>;
  /** delete data from the table: "transact_anpr_capture" */
  delete_transact_anpr_capture?: Maybe<Transact_Anpr_Capture_Mutation_Response>;
  /** delete single row from the table: "transact_anpr_capture" */
  delete_transact_anpr_capture_by_pk?: Maybe<Transact_Anpr_Capture>;
  /** delete data from the table: "transact_axle_capture" */
  delete_transact_axle_capture?: Maybe<Transact_Axle_Capture_Mutation_Response>;
  /** delete single row from the table: "transact_axle_capture" */
  delete_transact_axle_capture_by_pk?: Maybe<Transact_Axle_Capture>;
  /** delete data from the table: "transact_cctv" */
  delete_transact_cctv?: Maybe<Transact_Cctv_Mutation_Response>;
  /** delete single row from the table: "transact_cctv" */
  delete_transact_cctv_by_pk?: Maybe<Transact_Cctv>;
  /** delete data from the table: "transact_dimension" */
  delete_transact_dimension?: Maybe<Transact_Dimension_Mutation_Response>;
  /** delete single row from the table: "transact_dimension" */
  delete_transact_dimension_by_pk?: Maybe<Transact_Dimension>;
  /** delete data from the table: "transact_session_source" */
  delete_transact_session_source?: Maybe<Transact_Session_Source_Mutation_Response>;
  /** delete single row from the table: "transact_session_source" */
  delete_transact_session_source_by_pk?: Maybe<Transact_Session_Source>;
  /** delete data from the table: "transact_vehicle_actual" */
  delete_transact_vehicle_actual?: Maybe<Transact_Vehicle_Actual_Mutation_Response>;
  /** delete single row from the table: "transact_vehicle_actual" */
  delete_transact_vehicle_actual_by_pk?: Maybe<Transact_Vehicle_Actual>;
  /** delete data from the table: "transact_vehicle_revision" */
  delete_transact_vehicle_revision?: Maybe<Transact_Vehicle_Revision_Mutation_Response>;
  /** delete single row from the table: "transact_vehicle_revision" */
  delete_transact_vehicle_revision_by_pk?: Maybe<Transact_Vehicle_Revision>;
  /** delete data from the table: "transact_vehicle_status" */
  delete_transact_vehicle_status?: Maybe<Transact_Vehicle_Status_Mutation_Response>;
  /** delete single row from the table: "transact_vehicle_status" */
  delete_transact_vehicle_status_by_pk?: Maybe<Transact_Vehicle_Status>;
  /** delete data from the table: "transact_weighing" */
  delete_transact_weighing?: Maybe<Transact_Weighing_Mutation_Response>;
  /** delete single row from the table: "transact_weighing" */
  delete_transact_weighing_by_pk?: Maybe<Transact_Weighing>;
  /** delete data from the table: "transact_wim_session" */
  delete_transact_wim_session?: Maybe<Transact_Wim_Session_Mutation_Response>;
  /** delete single row from the table: "transact_wim_session" */
  delete_transact_wim_session_by_pk?: Maybe<Transact_Wim_Session>;
  /** delete data from the table: "user_login_history" */
  delete_user_login_history?: Maybe<User_Login_History_Mutation_Response>;
  /** delete single row from the table: "user_login_history" */
  delete_user_login_history_by_pk?: Maybe<User_Login_History>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** insert data into the table: "master_config" */
  insert_master_config?: Maybe<Master_Config_Mutation_Response>;
  /** insert a single row into the table: "master_config" */
  insert_master_config_one?: Maybe<Master_Config>;
  /** insert data into the table: "master_device" */
  insert_master_device?: Maybe<Master_Device_Mutation_Response>;
  /** insert a single row into the table: "master_device" */
  insert_master_device_one?: Maybe<Master_Device>;
  /** insert data into the table: "master_device_type" */
  insert_master_device_type?: Maybe<Master_Device_Type_Mutation_Response>;
  /** insert a single row into the table: "master_device_type" */
  insert_master_device_type_one?: Maybe<Master_Device_Type>;
  /** insert data into the table: "master_role" */
  insert_master_role?: Maybe<Master_Role_Mutation_Response>;
  /** insert a single row into the table: "master_role" */
  insert_master_role_one?: Maybe<Master_Role>;
  /** insert data into the table: "master_site" */
  insert_master_site?: Maybe<Master_Site_Mutation_Response>;
  /** insert a single row into the table: "master_site" */
  insert_master_site_one?: Maybe<Master_Site>;
  /** insert data into the table: "master_user" */
  insert_master_user?: Maybe<Master_User_Mutation_Response>;
  /** insert a single row into the table: "master_user" */
  insert_master_user_one?: Maybe<Master_User>;
  /** insert data into the table: "master_vehicle_class" */
  insert_master_vehicle_class?: Maybe<Master_Vehicle_Class_Mutation_Response>;
  /** insert a single row into the table: "master_vehicle_class" */
  insert_master_vehicle_class_one?: Maybe<Master_Vehicle_Class>;
  /** insert data into the table: "system_runtime_config" */
  insert_system_runtime_config?: Maybe<System_Runtime_Config_Mutation_Response>;
  /** insert a single row into the table: "system_runtime_config" */
  insert_system_runtime_config_one?: Maybe<System_Runtime_Config>;
  /** insert data into the table: "transact_anpr_capture" */
  insert_transact_anpr_capture?: Maybe<Transact_Anpr_Capture_Mutation_Response>;
  /** insert a single row into the table: "transact_anpr_capture" */
  insert_transact_anpr_capture_one?: Maybe<Transact_Anpr_Capture>;
  /** insert data into the table: "transact_axle_capture" */
  insert_transact_axle_capture?: Maybe<Transact_Axle_Capture_Mutation_Response>;
  /** insert a single row into the table: "transact_axle_capture" */
  insert_transact_axle_capture_one?: Maybe<Transact_Axle_Capture>;
  /** insert data into the table: "transact_cctv" */
  insert_transact_cctv?: Maybe<Transact_Cctv_Mutation_Response>;
  /** insert a single row into the table: "transact_cctv" */
  insert_transact_cctv_one?: Maybe<Transact_Cctv>;
  /** insert data into the table: "transact_dimension" */
  insert_transact_dimension?: Maybe<Transact_Dimension_Mutation_Response>;
  /** insert a single row into the table: "transact_dimension" */
  insert_transact_dimension_one?: Maybe<Transact_Dimension>;
  /** insert data into the table: "transact_session_source" */
  insert_transact_session_source?: Maybe<Transact_Session_Source_Mutation_Response>;
  /** insert a single row into the table: "transact_session_source" */
  insert_transact_session_source_one?: Maybe<Transact_Session_Source>;
  /** insert data into the table: "transact_vehicle_actual" */
  insert_transact_vehicle_actual?: Maybe<Transact_Vehicle_Actual_Mutation_Response>;
  /** insert a single row into the table: "transact_vehicle_actual" */
  insert_transact_vehicle_actual_one?: Maybe<Transact_Vehicle_Actual>;
  /** insert data into the table: "transact_vehicle_revision" */
  insert_transact_vehicle_revision?: Maybe<Transact_Vehicle_Revision_Mutation_Response>;
  /** insert a single row into the table: "transact_vehicle_revision" */
  insert_transact_vehicle_revision_one?: Maybe<Transact_Vehicle_Revision>;
  /** insert data into the table: "transact_vehicle_status" */
  insert_transact_vehicle_status?: Maybe<Transact_Vehicle_Status_Mutation_Response>;
  /** insert a single row into the table: "transact_vehicle_status" */
  insert_transact_vehicle_status_one?: Maybe<Transact_Vehicle_Status>;
  /** insert data into the table: "transact_weighing" */
  insert_transact_weighing?: Maybe<Transact_Weighing_Mutation_Response>;
  /** insert a single row into the table: "transact_weighing" */
  insert_transact_weighing_one?: Maybe<Transact_Weighing>;
  /** insert data into the table: "transact_wim_session" */
  insert_transact_wim_session?: Maybe<Transact_Wim_Session_Mutation_Response>;
  /** insert a single row into the table: "transact_wim_session" */
  insert_transact_wim_session_one?: Maybe<Transact_Wim_Session>;
  /** insert data into the table: "user_login_history" */
  insert_user_login_history?: Maybe<User_Login_History_Mutation_Response>;
  /** insert a single row into the table: "user_login_history" */
  insert_user_login_history_one?: Maybe<User_Login_History>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "master_config" */
  update_master_config?: Maybe<Master_Config_Mutation_Response>;
  /** update single row of the table: "master_config" */
  update_master_config_by_pk?: Maybe<Master_Config>;
  /** update multiples rows of table: "master_config" */
  update_master_config_many?: Maybe<Array<Maybe<Master_Config_Mutation_Response>>>;
  /** update data of the table: "master_device" */
  update_master_device?: Maybe<Master_Device_Mutation_Response>;
  /** update single row of the table: "master_device" */
  update_master_device_by_pk?: Maybe<Master_Device>;
  /** update multiples rows of table: "master_device" */
  update_master_device_many?: Maybe<Array<Maybe<Master_Device_Mutation_Response>>>;
  /** update data of the table: "master_device_type" */
  update_master_device_type?: Maybe<Master_Device_Type_Mutation_Response>;
  /** update single row of the table: "master_device_type" */
  update_master_device_type_by_pk?: Maybe<Master_Device_Type>;
  /** update multiples rows of table: "master_device_type" */
  update_master_device_type_many?: Maybe<Array<Maybe<Master_Device_Type_Mutation_Response>>>;
  /** update data of the table: "master_role" */
  update_master_role?: Maybe<Master_Role_Mutation_Response>;
  /** update single row of the table: "master_role" */
  update_master_role_by_pk?: Maybe<Master_Role>;
  /** update multiples rows of table: "master_role" */
  update_master_role_many?: Maybe<Array<Maybe<Master_Role_Mutation_Response>>>;
  /** update data of the table: "master_site" */
  update_master_site?: Maybe<Master_Site_Mutation_Response>;
  /** update single row of the table: "master_site" */
  update_master_site_by_pk?: Maybe<Master_Site>;
  /** update multiples rows of table: "master_site" */
  update_master_site_many?: Maybe<Array<Maybe<Master_Site_Mutation_Response>>>;
  /** update data of the table: "master_user" */
  update_master_user?: Maybe<Master_User_Mutation_Response>;
  /** update single row of the table: "master_user" */
  update_master_user_by_pk?: Maybe<Master_User>;
  /** update multiples rows of table: "master_user" */
  update_master_user_many?: Maybe<Array<Maybe<Master_User_Mutation_Response>>>;
  /** update data of the table: "master_vehicle_class" */
  update_master_vehicle_class?: Maybe<Master_Vehicle_Class_Mutation_Response>;
  /** update single row of the table: "master_vehicle_class" */
  update_master_vehicle_class_by_pk?: Maybe<Master_Vehicle_Class>;
  /** update multiples rows of table: "master_vehicle_class" */
  update_master_vehicle_class_many?: Maybe<Array<Maybe<Master_Vehicle_Class_Mutation_Response>>>;
  /** update data of the table: "system_runtime_config" */
  update_system_runtime_config?: Maybe<System_Runtime_Config_Mutation_Response>;
  /** update single row of the table: "system_runtime_config" */
  update_system_runtime_config_by_pk?: Maybe<System_Runtime_Config>;
  /** update multiples rows of table: "system_runtime_config" */
  update_system_runtime_config_many?: Maybe<Array<Maybe<System_Runtime_Config_Mutation_Response>>>;
  /** update data of the table: "transact_anpr_capture" */
  update_transact_anpr_capture?: Maybe<Transact_Anpr_Capture_Mutation_Response>;
  /** update single row of the table: "transact_anpr_capture" */
  update_transact_anpr_capture_by_pk?: Maybe<Transact_Anpr_Capture>;
  /** update multiples rows of table: "transact_anpr_capture" */
  update_transact_anpr_capture_many?: Maybe<Array<Maybe<Transact_Anpr_Capture_Mutation_Response>>>;
  /** update data of the table: "transact_axle_capture" */
  update_transact_axle_capture?: Maybe<Transact_Axle_Capture_Mutation_Response>;
  /** update single row of the table: "transact_axle_capture" */
  update_transact_axle_capture_by_pk?: Maybe<Transact_Axle_Capture>;
  /** update multiples rows of table: "transact_axle_capture" */
  update_transact_axle_capture_many?: Maybe<Array<Maybe<Transact_Axle_Capture_Mutation_Response>>>;
  /** update data of the table: "transact_cctv" */
  update_transact_cctv?: Maybe<Transact_Cctv_Mutation_Response>;
  /** update single row of the table: "transact_cctv" */
  update_transact_cctv_by_pk?: Maybe<Transact_Cctv>;
  /** update multiples rows of table: "transact_cctv" */
  update_transact_cctv_many?: Maybe<Array<Maybe<Transact_Cctv_Mutation_Response>>>;
  /** update data of the table: "transact_dimension" */
  update_transact_dimension?: Maybe<Transact_Dimension_Mutation_Response>;
  /** update single row of the table: "transact_dimension" */
  update_transact_dimension_by_pk?: Maybe<Transact_Dimension>;
  /** update multiples rows of table: "transact_dimension" */
  update_transact_dimension_many?: Maybe<Array<Maybe<Transact_Dimension_Mutation_Response>>>;
  /** update data of the table: "transact_session_source" */
  update_transact_session_source?: Maybe<Transact_Session_Source_Mutation_Response>;
  /** update single row of the table: "transact_session_source" */
  update_transact_session_source_by_pk?: Maybe<Transact_Session_Source>;
  /** update multiples rows of table: "transact_session_source" */
  update_transact_session_source_many?: Maybe<Array<Maybe<Transact_Session_Source_Mutation_Response>>>;
  /** update data of the table: "transact_vehicle_actual" */
  update_transact_vehicle_actual?: Maybe<Transact_Vehicle_Actual_Mutation_Response>;
  /** update single row of the table: "transact_vehicle_actual" */
  update_transact_vehicle_actual_by_pk?: Maybe<Transact_Vehicle_Actual>;
  /** update multiples rows of table: "transact_vehicle_actual" */
  update_transact_vehicle_actual_many?: Maybe<Array<Maybe<Transact_Vehicle_Actual_Mutation_Response>>>;
  /** update data of the table: "transact_vehicle_revision" */
  update_transact_vehicle_revision?: Maybe<Transact_Vehicle_Revision_Mutation_Response>;
  /** update single row of the table: "transact_vehicle_revision" */
  update_transact_vehicle_revision_by_pk?: Maybe<Transact_Vehicle_Revision>;
  /** update multiples rows of table: "transact_vehicle_revision" */
  update_transact_vehicle_revision_many?: Maybe<Array<Maybe<Transact_Vehicle_Revision_Mutation_Response>>>;
  /** update data of the table: "transact_vehicle_status" */
  update_transact_vehicle_status?: Maybe<Transact_Vehicle_Status_Mutation_Response>;
  /** update single row of the table: "transact_vehicle_status" */
  update_transact_vehicle_status_by_pk?: Maybe<Transact_Vehicle_Status>;
  /** update multiples rows of table: "transact_vehicle_status" */
  update_transact_vehicle_status_many?: Maybe<Array<Maybe<Transact_Vehicle_Status_Mutation_Response>>>;
  /** update data of the table: "transact_weighing" */
  update_transact_weighing?: Maybe<Transact_Weighing_Mutation_Response>;
  /** update single row of the table: "transact_weighing" */
  update_transact_weighing_by_pk?: Maybe<Transact_Weighing>;
  /** update multiples rows of table: "transact_weighing" */
  update_transact_weighing_many?: Maybe<Array<Maybe<Transact_Weighing_Mutation_Response>>>;
  /** update data of the table: "transact_wim_session" */
  update_transact_wim_session?: Maybe<Transact_Wim_Session_Mutation_Response>;
  /** update single row of the table: "transact_wim_session" */
  update_transact_wim_session_by_pk?: Maybe<Transact_Wim_Session>;
  /** update multiples rows of table: "transact_wim_session" */
  update_transact_wim_session_many?: Maybe<Array<Maybe<Transact_Wim_Session_Mutation_Response>>>;
  /** update data of the table: "user_login_history" */
  update_user_login_history?: Maybe<User_Login_History_Mutation_Response>;
  /** update single row of the table: "user_login_history" */
  update_user_login_history_by_pk?: Maybe<User_Login_History>;
  /** update multiples rows of table: "user_login_history" */
  update_user_login_history_many?: Maybe<Array<Maybe<User_Login_History_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Master_ConfigArgs = {
  where: Master_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_DeviceArgs = {
  where: Master_Device_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_Device_TypeArgs = {
  where: Master_Device_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Device_Type_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_RoleArgs = {
  where: Master_Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Role_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_SiteArgs = {
  where: Master_Site_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Site_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_UserArgs = {
  where: Master_User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_User_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Master_Vehicle_ClassArgs = {
  where: Master_Vehicle_Class_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Master_Vehicle_Class_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_System_Runtime_ConfigArgs = {
  where: System_Runtime_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_System_Runtime_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Anpr_CaptureArgs = {
  where: Transact_Anpr_Capture_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Anpr_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Axle_CaptureArgs = {
  where: Transact_Axle_Capture_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Axle_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_CctvArgs = {
  where: Transact_Cctv_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Cctv_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_DimensionArgs = {
  where: Transact_Dimension_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Dimension_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Session_SourceArgs = {
  where: Transact_Session_Source_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Session_Source_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_ActualArgs = {
  where: Transact_Vehicle_Actual_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_Actual_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_RevisionArgs = {
  where: Transact_Vehicle_Revision_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_Revision_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_StatusArgs = {
  where: Transact_Vehicle_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Vehicle_Status_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_WeighingArgs = {
  where: Transact_Weighing_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Weighing_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Transact_Wim_SessionArgs = {
  where: Transact_Wim_Session_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transact_Wim_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_Login_HistoryArgs = {
  where: User_Login_History_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Login_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootInsert_Master_ConfigArgs = {
  objects: Array<Master_Config_Insert_Input>;
  on_conflict?: InputMaybe<Master_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Config_OneArgs = {
  object: Master_Config_Insert_Input;
  on_conflict?: InputMaybe<Master_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_DeviceArgs = {
  objects: Array<Master_Device_Insert_Input>;
  on_conflict?: InputMaybe<Master_Device_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Device_OneArgs = {
  object: Master_Device_Insert_Input;
  on_conflict?: InputMaybe<Master_Device_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Device_TypeArgs = {
  objects: Array<Master_Device_Type_Insert_Input>;
  on_conflict?: InputMaybe<Master_Device_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Device_Type_OneArgs = {
  object: Master_Device_Type_Insert_Input;
  on_conflict?: InputMaybe<Master_Device_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_RoleArgs = {
  objects: Array<Master_Role_Insert_Input>;
  on_conflict?: InputMaybe<Master_Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Role_OneArgs = {
  object: Master_Role_Insert_Input;
  on_conflict?: InputMaybe<Master_Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_SiteArgs = {
  objects: Array<Master_Site_Insert_Input>;
  on_conflict?: InputMaybe<Master_Site_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Site_OneArgs = {
  object: Master_Site_Insert_Input;
  on_conflict?: InputMaybe<Master_Site_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_UserArgs = {
  objects: Array<Master_User_Insert_Input>;
  on_conflict?: InputMaybe<Master_User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_User_OneArgs = {
  object: Master_User_Insert_Input;
  on_conflict?: InputMaybe<Master_User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Vehicle_ClassArgs = {
  objects: Array<Master_Vehicle_Class_Insert_Input>;
  on_conflict?: InputMaybe<Master_Vehicle_Class_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Master_Vehicle_Class_OneArgs = {
  object: Master_Vehicle_Class_Insert_Input;
  on_conflict?: InputMaybe<Master_Vehicle_Class_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_Runtime_ConfigArgs = {
  objects: Array<System_Runtime_Config_Insert_Input>;
  on_conflict?: InputMaybe<System_Runtime_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_Runtime_Config_OneArgs = {
  object: System_Runtime_Config_Insert_Input;
  on_conflict?: InputMaybe<System_Runtime_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Anpr_CaptureArgs = {
  objects: Array<Transact_Anpr_Capture_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Anpr_Capture_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Anpr_Capture_OneArgs = {
  object: Transact_Anpr_Capture_Insert_Input;
  on_conflict?: InputMaybe<Transact_Anpr_Capture_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Axle_CaptureArgs = {
  objects: Array<Transact_Axle_Capture_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Axle_Capture_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Axle_Capture_OneArgs = {
  object: Transact_Axle_Capture_Insert_Input;
  on_conflict?: InputMaybe<Transact_Axle_Capture_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_CctvArgs = {
  objects: Array<Transact_Cctv_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Cctv_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Cctv_OneArgs = {
  object: Transact_Cctv_Insert_Input;
  on_conflict?: InputMaybe<Transact_Cctv_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_DimensionArgs = {
  objects: Array<Transact_Dimension_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Dimension_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Dimension_OneArgs = {
  object: Transact_Dimension_Insert_Input;
  on_conflict?: InputMaybe<Transact_Dimension_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Session_SourceArgs = {
  objects: Array<Transact_Session_Source_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Session_Source_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Session_Source_OneArgs = {
  object: Transact_Session_Source_Insert_Input;
  on_conflict?: InputMaybe<Transact_Session_Source_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_ActualArgs = {
  objects: Array<Transact_Vehicle_Actual_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Vehicle_Actual_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_Actual_OneArgs = {
  object: Transact_Vehicle_Actual_Insert_Input;
  on_conflict?: InputMaybe<Transact_Vehicle_Actual_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_RevisionArgs = {
  objects: Array<Transact_Vehicle_Revision_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Vehicle_Revision_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_Revision_OneArgs = {
  object: Transact_Vehicle_Revision_Insert_Input;
  on_conflict?: InputMaybe<Transact_Vehicle_Revision_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_StatusArgs = {
  objects: Array<Transact_Vehicle_Status_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Vehicle_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Vehicle_Status_OneArgs = {
  object: Transact_Vehicle_Status_Insert_Input;
  on_conflict?: InputMaybe<Transact_Vehicle_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_WeighingArgs = {
  objects: Array<Transact_Weighing_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Weighing_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Weighing_OneArgs = {
  object: Transact_Weighing_Insert_Input;
  on_conflict?: InputMaybe<Transact_Weighing_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Wim_SessionArgs = {
  objects: Array<Transact_Wim_Session_Insert_Input>;
  on_conflict?: InputMaybe<Transact_Wim_Session_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transact_Wim_Session_OneArgs = {
  object: Transact_Wim_Session_Insert_Input;
  on_conflict?: InputMaybe<Transact_Wim_Session_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Login_HistoryArgs = {
  objects: Array<User_Login_History_Insert_Input>;
  on_conflict?: InputMaybe<User_Login_History_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Login_History_OneArgs = {
  object: User_Login_History_Insert_Input;
  on_conflict?: InputMaybe<User_Login_History_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_ConfigArgs = {
  _inc?: InputMaybe<Master_Config_Inc_Input>;
  _set?: InputMaybe<Master_Config_Set_Input>;
  where: Master_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Config_By_PkArgs = {
  _inc?: InputMaybe<Master_Config_Inc_Input>;
  _set?: InputMaybe<Master_Config_Set_Input>;
  pk_columns: Master_Config_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Config_ManyArgs = {
  updates: Array<Master_Config_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_DeviceArgs = {
  _set?: InputMaybe<Master_Device_Set_Input>;
  where: Master_Device_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Device_By_PkArgs = {
  _set?: InputMaybe<Master_Device_Set_Input>;
  pk_columns: Master_Device_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Device_ManyArgs = {
  updates: Array<Master_Device_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Device_TypeArgs = {
  _set?: InputMaybe<Master_Device_Type_Set_Input>;
  where: Master_Device_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Device_Type_By_PkArgs = {
  _set?: InputMaybe<Master_Device_Type_Set_Input>;
  pk_columns: Master_Device_Type_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Device_Type_ManyArgs = {
  updates: Array<Master_Device_Type_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_RoleArgs = {
  _set?: InputMaybe<Master_Role_Set_Input>;
  where: Master_Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Role_By_PkArgs = {
  _set?: InputMaybe<Master_Role_Set_Input>;
  pk_columns: Master_Role_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Role_ManyArgs = {
  updates: Array<Master_Role_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_SiteArgs = {
  _inc?: InputMaybe<Master_Site_Inc_Input>;
  _set?: InputMaybe<Master_Site_Set_Input>;
  where: Master_Site_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Site_By_PkArgs = {
  _inc?: InputMaybe<Master_Site_Inc_Input>;
  _set?: InputMaybe<Master_Site_Set_Input>;
  pk_columns: Master_Site_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Site_ManyArgs = {
  updates: Array<Master_Site_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_UserArgs = {
  _set?: InputMaybe<Master_User_Set_Input>;
  where: Master_User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_User_By_PkArgs = {
  _set?: InputMaybe<Master_User_Set_Input>;
  pk_columns: Master_User_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_User_ManyArgs = {
  updates: Array<Master_User_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Vehicle_ClassArgs = {
  _inc?: InputMaybe<Master_Vehicle_Class_Inc_Input>;
  _set?: InputMaybe<Master_Vehicle_Class_Set_Input>;
  where: Master_Vehicle_Class_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Vehicle_Class_By_PkArgs = {
  _inc?: InputMaybe<Master_Vehicle_Class_Inc_Input>;
  _set?: InputMaybe<Master_Vehicle_Class_Set_Input>;
  pk_columns: Master_Vehicle_Class_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Master_Vehicle_Class_ManyArgs = {
  updates: Array<Master_Vehicle_Class_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_System_Runtime_ConfigArgs = {
  _inc?: InputMaybe<System_Runtime_Config_Inc_Input>;
  _set?: InputMaybe<System_Runtime_Config_Set_Input>;
  where: System_Runtime_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_System_Runtime_Config_By_PkArgs = {
  _inc?: InputMaybe<System_Runtime_Config_Inc_Input>;
  _set?: InputMaybe<System_Runtime_Config_Set_Input>;
  pk_columns: System_Runtime_Config_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_System_Runtime_Config_ManyArgs = {
  updates: Array<System_Runtime_Config_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Anpr_CaptureArgs = {
  _inc?: InputMaybe<Transact_Anpr_Capture_Inc_Input>;
  _set?: InputMaybe<Transact_Anpr_Capture_Set_Input>;
  where: Transact_Anpr_Capture_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Anpr_Capture_By_PkArgs = {
  _inc?: InputMaybe<Transact_Anpr_Capture_Inc_Input>;
  _set?: InputMaybe<Transact_Anpr_Capture_Set_Input>;
  pk_columns: Transact_Anpr_Capture_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Anpr_Capture_ManyArgs = {
  updates: Array<Transact_Anpr_Capture_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Axle_CaptureArgs = {
  _inc?: InputMaybe<Transact_Axle_Capture_Inc_Input>;
  _set?: InputMaybe<Transact_Axle_Capture_Set_Input>;
  where: Transact_Axle_Capture_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Axle_Capture_By_PkArgs = {
  _inc?: InputMaybe<Transact_Axle_Capture_Inc_Input>;
  _set?: InputMaybe<Transact_Axle_Capture_Set_Input>;
  pk_columns: Transact_Axle_Capture_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Axle_Capture_ManyArgs = {
  updates: Array<Transact_Axle_Capture_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_CctvArgs = {
  _set?: InputMaybe<Transact_Cctv_Set_Input>;
  where: Transact_Cctv_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Cctv_By_PkArgs = {
  _set?: InputMaybe<Transact_Cctv_Set_Input>;
  pk_columns: Transact_Cctv_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Cctv_ManyArgs = {
  updates: Array<Transact_Cctv_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_DimensionArgs = {
  _inc?: InputMaybe<Transact_Dimension_Inc_Input>;
  _set?: InputMaybe<Transact_Dimension_Set_Input>;
  where: Transact_Dimension_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Dimension_By_PkArgs = {
  _inc?: InputMaybe<Transact_Dimension_Inc_Input>;
  _set?: InputMaybe<Transact_Dimension_Set_Input>;
  pk_columns: Transact_Dimension_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Dimension_ManyArgs = {
  updates: Array<Transact_Dimension_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Session_SourceArgs = {
  _append?: InputMaybe<Transact_Session_Source_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Session_Source_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Session_Source_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Session_Source_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Session_Source_Inc_Input>;
  _prepend?: InputMaybe<Transact_Session_Source_Prepend_Input>;
  _set?: InputMaybe<Transact_Session_Source_Set_Input>;
  where: Transact_Session_Source_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Session_Source_By_PkArgs = {
  _append?: InputMaybe<Transact_Session_Source_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Session_Source_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Session_Source_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Session_Source_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Session_Source_Inc_Input>;
  _prepend?: InputMaybe<Transact_Session_Source_Prepend_Input>;
  _set?: InputMaybe<Transact_Session_Source_Set_Input>;
  pk_columns: Transact_Session_Source_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Session_Source_ManyArgs = {
  updates: Array<Transact_Session_Source_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_ActualArgs = {
  _inc?: InputMaybe<Transact_Vehicle_Actual_Inc_Input>;
  _set?: InputMaybe<Transact_Vehicle_Actual_Set_Input>;
  where: Transact_Vehicle_Actual_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Actual_By_PkArgs = {
  _inc?: InputMaybe<Transact_Vehicle_Actual_Inc_Input>;
  _set?: InputMaybe<Transact_Vehicle_Actual_Set_Input>;
  pk_columns: Transact_Vehicle_Actual_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Actual_ManyArgs = {
  updates: Array<Transact_Vehicle_Actual_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_RevisionArgs = {
  _append?: InputMaybe<Transact_Vehicle_Revision_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Vehicle_Revision_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Vehicle_Revision_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Vehicle_Revision_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Vehicle_Revision_Inc_Input>;
  _prepend?: InputMaybe<Transact_Vehicle_Revision_Prepend_Input>;
  _set?: InputMaybe<Transact_Vehicle_Revision_Set_Input>;
  where: Transact_Vehicle_Revision_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Revision_By_PkArgs = {
  _append?: InputMaybe<Transact_Vehicle_Revision_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Vehicle_Revision_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Vehicle_Revision_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Vehicle_Revision_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Vehicle_Revision_Inc_Input>;
  _prepend?: InputMaybe<Transact_Vehicle_Revision_Prepend_Input>;
  _set?: InputMaybe<Transact_Vehicle_Revision_Set_Input>;
  pk_columns: Transact_Vehicle_Revision_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Revision_ManyArgs = {
  updates: Array<Transact_Vehicle_Revision_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_StatusArgs = {
  _set?: InputMaybe<Transact_Vehicle_Status_Set_Input>;
  where: Transact_Vehicle_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Status_By_PkArgs = {
  _set?: InputMaybe<Transact_Vehicle_Status_Set_Input>;
  pk_columns: Transact_Vehicle_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Vehicle_Status_ManyArgs = {
  updates: Array<Transact_Vehicle_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_WeighingArgs = {
  _append?: InputMaybe<Transact_Weighing_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Weighing_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Weighing_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Weighing_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Weighing_Inc_Input>;
  _prepend?: InputMaybe<Transact_Weighing_Prepend_Input>;
  _set?: InputMaybe<Transact_Weighing_Set_Input>;
  where: Transact_Weighing_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Weighing_By_PkArgs = {
  _append?: InputMaybe<Transact_Weighing_Append_Input>;
  _delete_at_path?: InputMaybe<Transact_Weighing_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transact_Weighing_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transact_Weighing_Delete_Key_Input>;
  _inc?: InputMaybe<Transact_Weighing_Inc_Input>;
  _prepend?: InputMaybe<Transact_Weighing_Prepend_Input>;
  _set?: InputMaybe<Transact_Weighing_Set_Input>;
  pk_columns: Transact_Weighing_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Weighing_ManyArgs = {
  updates: Array<Transact_Weighing_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Wim_SessionArgs = {
  _inc?: InputMaybe<Transact_Wim_Session_Inc_Input>;
  _set?: InputMaybe<Transact_Wim_Session_Set_Input>;
  where: Transact_Wim_Session_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Wim_Session_By_PkArgs = {
  _inc?: InputMaybe<Transact_Wim_Session_Inc_Input>;
  _set?: InputMaybe<Transact_Wim_Session_Set_Input>;
  pk_columns: Transact_Wim_Session_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transact_Wim_Session_ManyArgs = {
  updates: Array<Transact_Wim_Session_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_Login_HistoryArgs = {
  _set?: InputMaybe<User_Login_History_Set_Input>;
  where: User_Login_History_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Login_History_By_PkArgs = {
  _set?: InputMaybe<User_Login_History_Set_Input>;
  pk_columns: User_Login_History_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Login_History_ManyArgs = {
  updates: Array<User_Login_History_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  /** fetch data from the table: "master_config" */
  master_config: Array<Master_Config>;
  /** fetch aggregated fields from the table: "master_config" */
  master_config_aggregate: Master_Config_Aggregate;
  /** fetch data from the table: "master_config" using primary key columns */
  master_config_by_pk?: Maybe<Master_Config>;
  /** fetch data from the table: "master_device" */
  master_device: Array<Master_Device>;
  /** fetch aggregated fields from the table: "master_device" */
  master_device_aggregate: Master_Device_Aggregate;
  /** fetch data from the table: "master_device" using primary key columns */
  master_device_by_pk?: Maybe<Master_Device>;
  /** fetch data from the table: "master_device_type" */
  master_device_type: Array<Master_Device_Type>;
  /** fetch aggregated fields from the table: "master_device_type" */
  master_device_type_aggregate: Master_Device_Type_Aggregate;
  /** fetch data from the table: "master_device_type" using primary key columns */
  master_device_type_by_pk?: Maybe<Master_Device_Type>;
  /** fetch data from the table: "master_role" */
  master_role: Array<Master_Role>;
  /** fetch aggregated fields from the table: "master_role" */
  master_role_aggregate: Master_Role_Aggregate;
  /** fetch data from the table: "master_role" using primary key columns */
  master_role_by_pk?: Maybe<Master_Role>;
  /** fetch data from the table: "master_site" */
  master_site: Array<Master_Site>;
  /** fetch aggregated fields from the table: "master_site" */
  master_site_aggregate: Master_Site_Aggregate;
  /** fetch data from the table: "master_site" using primary key columns */
  master_site_by_pk?: Maybe<Master_Site>;
  /** fetch data from the table: "master_user" */
  master_user: Array<Master_User>;
  /** fetch aggregated fields from the table: "master_user" */
  master_user_aggregate: Master_User_Aggregate;
  /** fetch data from the table: "master_user" using primary key columns */
  master_user_by_pk?: Maybe<Master_User>;
  /** fetch data from the table: "master_vehicle_class" */
  master_vehicle_class: Array<Master_Vehicle_Class>;
  /** fetch aggregated fields from the table: "master_vehicle_class" */
  master_vehicle_class_aggregate: Master_Vehicle_Class_Aggregate;
  /** fetch data from the table: "master_vehicle_class" using primary key columns */
  master_vehicle_class_by_pk?: Maybe<Master_Vehicle_Class>;
  /** fetch data from the table: "system_runtime_config" */
  system_runtime_config: Array<System_Runtime_Config>;
  /** fetch aggregated fields from the table: "system_runtime_config" */
  system_runtime_config_aggregate: System_Runtime_Config_Aggregate;
  /** fetch data from the table: "system_runtime_config" using primary key columns */
  system_runtime_config_by_pk?: Maybe<System_Runtime_Config>;
  /** fetch data from the table: "transact_anpr_capture" */
  transact_anpr_capture: Array<Transact_Anpr_Capture>;
  /** fetch aggregated fields from the table: "transact_anpr_capture" */
  transact_anpr_capture_aggregate: Transact_Anpr_Capture_Aggregate;
  /** fetch data from the table: "transact_anpr_capture" using primary key columns */
  transact_anpr_capture_by_pk?: Maybe<Transact_Anpr_Capture>;
  /** fetch data from the table: "transact_axle_capture" */
  transact_axle_capture: Array<Transact_Axle_Capture>;
  /** fetch aggregated fields from the table: "transact_axle_capture" */
  transact_axle_capture_aggregate: Transact_Axle_Capture_Aggregate;
  /** fetch data from the table: "transact_axle_capture" using primary key columns */
  transact_axle_capture_by_pk?: Maybe<Transact_Axle_Capture>;
  /** fetch data from the table: "transact_cctv" */
  transact_cctv: Array<Transact_Cctv>;
  /** fetch aggregated fields from the table: "transact_cctv" */
  transact_cctv_aggregate: Transact_Cctv_Aggregate;
  /** fetch data from the table: "transact_cctv" using primary key columns */
  transact_cctv_by_pk?: Maybe<Transact_Cctv>;
  /** fetch data from the table: "transact_dimension" */
  transact_dimension: Array<Transact_Dimension>;
  /** fetch aggregated fields from the table: "transact_dimension" */
  transact_dimension_aggregate: Transact_Dimension_Aggregate;
  /** fetch data from the table: "transact_dimension" using primary key columns */
  transact_dimension_by_pk?: Maybe<Transact_Dimension>;
  /** fetch data from the table: "transact_session_source" */
  transact_session_source: Array<Transact_Session_Source>;
  /** fetch aggregated fields from the table: "transact_session_source" */
  transact_session_source_aggregate: Transact_Session_Source_Aggregate;
  /** fetch data from the table: "transact_session_source" using primary key columns */
  transact_session_source_by_pk?: Maybe<Transact_Session_Source>;
  /** fetch data from the table: "transact_vehicle_actual" */
  transact_vehicle_actual: Array<Transact_Vehicle_Actual>;
  /** fetch aggregated fields from the table: "transact_vehicle_actual" */
  transact_vehicle_actual_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** fetch data from the table: "transact_vehicle_actual" using primary key columns */
  transact_vehicle_actual_by_pk?: Maybe<Transact_Vehicle_Actual>;
  /** fetch data from the table: "transact_vehicle_revision" */
  transact_vehicle_revision: Array<Transact_Vehicle_Revision>;
  /** fetch aggregated fields from the table: "transact_vehicle_revision" */
  transact_vehicle_revision_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** fetch data from the table: "transact_vehicle_revision" using primary key columns */
  transact_vehicle_revision_by_pk?: Maybe<Transact_Vehicle_Revision>;
  /** fetch data from the table: "transact_vehicle_status" */
  transact_vehicle_status: Array<Transact_Vehicle_Status>;
  /** fetch aggregated fields from the table: "transact_vehicle_status" */
  transact_vehicle_status_aggregate: Transact_Vehicle_Status_Aggregate;
  /** fetch data from the table: "transact_vehicle_status" using primary key columns */
  transact_vehicle_status_by_pk?: Maybe<Transact_Vehicle_Status>;
  /** fetch data from the table: "transact_weighing" */
  transact_weighing: Array<Transact_Weighing>;
  /** fetch aggregated fields from the table: "transact_weighing" */
  transact_weighing_aggregate: Transact_Weighing_Aggregate;
  /** fetch data from the table: "transact_weighing" using primary key columns */
  transact_weighing_by_pk?: Maybe<Transact_Weighing>;
  /** fetch data from the table: "transact_wim_session" */
  transact_wim_session: Array<Transact_Wim_Session>;
  /** fetch aggregated fields from the table: "transact_wim_session" */
  transact_wim_session_aggregate: Transact_Wim_Session_Aggregate;
  /** fetch data from the table: "transact_wim_session" using primary key columns */
  transact_wim_session_by_pk?: Maybe<Transact_Wim_Session>;
  /** fetch data from the table: "user_login_history" */
  user_login_history: Array<User_Login_History>;
  /** fetch aggregated fields from the table: "user_login_history" */
  user_login_history_aggregate: User_Login_History_Aggregate;
  /** fetch data from the table: "user_login_history" using primary key columns */
  user_login_history_by_pk?: Maybe<User_Login_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Query_RootMaster_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


export type Query_RootMaster_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


export type Query_RootMaster_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_DeviceArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


export type Query_RootMaster_Device_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


export type Query_RootMaster_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_Device_TypeArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Type_Order_By>>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};


export type Query_RootMaster_Device_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Type_Order_By>>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};


export type Query_RootMaster_Device_Type_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_RoleArgs = {
  distinct_on?: InputMaybe<Array<Master_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Role_Order_By>>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};


export type Query_RootMaster_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Role_Order_By>>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};


export type Query_RootMaster_Role_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_SiteArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


export type Query_RootMaster_Site_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


export type Query_RootMaster_Site_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_UserArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


export type Query_RootMaster_User_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


export type Query_RootMaster_User_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMaster_Vehicle_ClassArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


export type Query_RootMaster_Vehicle_Class_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


export type Query_RootMaster_Vehicle_Class_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootSystem_Runtime_ConfigArgs = {
  distinct_on?: InputMaybe<Array<System_Runtime_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Runtime_Config_Order_By>>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};


export type Query_RootSystem_Runtime_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Runtime_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Runtime_Config_Order_By>>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};


export type Query_RootSystem_Runtime_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Anpr_CaptureArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


export type Query_RootTransact_Anpr_Capture_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


export type Query_RootTransact_Anpr_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Axle_CaptureArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


export type Query_RootTransact_Axle_Capture_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


export type Query_RootTransact_Axle_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_CctvArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


export type Query_RootTransact_Cctv_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


export type Query_RootTransact_Cctv_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_DimensionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


export type Query_RootTransact_Dimension_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


export type Query_RootTransact_Dimension_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Session_SourceArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


export type Query_RootTransact_Session_Source_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


export type Query_RootTransact_Session_Source_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Vehicle_ActualArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Actual_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Actual_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Vehicle_RevisionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Revision_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Revision_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Vehicle_StatusArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


export type Query_RootTransact_Vehicle_Status_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_WeighingArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


export type Query_RootTransact_Weighing_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


export type Query_RootTransact_Weighing_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransact_Wim_SessionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


export type Query_RootTransact_Wim_Session_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


export type Query_RootTransact_Wim_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUser_Login_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


export type Query_RootUser_Login_History_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


export type Query_RootUser_Login_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_Root = {
  /** fetch data from the table: "master_config" */
  master_config: Array<Master_Config>;
  /** fetch aggregated fields from the table: "master_config" */
  master_config_aggregate: Master_Config_Aggregate;
  /** fetch data from the table: "master_config" using primary key columns */
  master_config_by_pk?: Maybe<Master_Config>;
  /** fetch data from the table in a streaming manner: "master_config" */
  master_config_stream: Array<Master_Config>;
  /** fetch data from the table: "master_device" */
  master_device: Array<Master_Device>;
  /** fetch aggregated fields from the table: "master_device" */
  master_device_aggregate: Master_Device_Aggregate;
  /** fetch data from the table: "master_device" using primary key columns */
  master_device_by_pk?: Maybe<Master_Device>;
  /** fetch data from the table in a streaming manner: "master_device" */
  master_device_stream: Array<Master_Device>;
  /** fetch data from the table: "master_device_type" */
  master_device_type: Array<Master_Device_Type>;
  /** fetch aggregated fields from the table: "master_device_type" */
  master_device_type_aggregate: Master_Device_Type_Aggregate;
  /** fetch data from the table: "master_device_type" using primary key columns */
  master_device_type_by_pk?: Maybe<Master_Device_Type>;
  /** fetch data from the table in a streaming manner: "master_device_type" */
  master_device_type_stream: Array<Master_Device_Type>;
  /** fetch data from the table: "master_role" */
  master_role: Array<Master_Role>;
  /** fetch aggregated fields from the table: "master_role" */
  master_role_aggregate: Master_Role_Aggregate;
  /** fetch data from the table: "master_role" using primary key columns */
  master_role_by_pk?: Maybe<Master_Role>;
  /** fetch data from the table in a streaming manner: "master_role" */
  master_role_stream: Array<Master_Role>;
  /** fetch data from the table: "master_site" */
  master_site: Array<Master_Site>;
  /** fetch aggregated fields from the table: "master_site" */
  master_site_aggregate: Master_Site_Aggregate;
  /** fetch data from the table: "master_site" using primary key columns */
  master_site_by_pk?: Maybe<Master_Site>;
  /** fetch data from the table in a streaming manner: "master_site" */
  master_site_stream: Array<Master_Site>;
  /** fetch data from the table: "master_user" */
  master_user: Array<Master_User>;
  /** fetch aggregated fields from the table: "master_user" */
  master_user_aggregate: Master_User_Aggregate;
  /** fetch data from the table: "master_user" using primary key columns */
  master_user_by_pk?: Maybe<Master_User>;
  /** fetch data from the table in a streaming manner: "master_user" */
  master_user_stream: Array<Master_User>;
  /** fetch data from the table: "master_vehicle_class" */
  master_vehicle_class: Array<Master_Vehicle_Class>;
  /** fetch aggregated fields from the table: "master_vehicle_class" */
  master_vehicle_class_aggregate: Master_Vehicle_Class_Aggregate;
  /** fetch data from the table: "master_vehicle_class" using primary key columns */
  master_vehicle_class_by_pk?: Maybe<Master_Vehicle_Class>;
  /** fetch data from the table in a streaming manner: "master_vehicle_class" */
  master_vehicle_class_stream: Array<Master_Vehicle_Class>;
  /** fetch data from the table: "system_runtime_config" */
  system_runtime_config: Array<System_Runtime_Config>;
  /** fetch aggregated fields from the table: "system_runtime_config" */
  system_runtime_config_aggregate: System_Runtime_Config_Aggregate;
  /** fetch data from the table: "system_runtime_config" using primary key columns */
  system_runtime_config_by_pk?: Maybe<System_Runtime_Config>;
  /** fetch data from the table in a streaming manner: "system_runtime_config" */
  system_runtime_config_stream: Array<System_Runtime_Config>;
  /** fetch data from the table: "transact_anpr_capture" */
  transact_anpr_capture: Array<Transact_Anpr_Capture>;
  /** fetch aggregated fields from the table: "transact_anpr_capture" */
  transact_anpr_capture_aggregate: Transact_Anpr_Capture_Aggregate;
  /** fetch data from the table: "transact_anpr_capture" using primary key columns */
  transact_anpr_capture_by_pk?: Maybe<Transact_Anpr_Capture>;
  /** fetch data from the table in a streaming manner: "transact_anpr_capture" */
  transact_anpr_capture_stream: Array<Transact_Anpr_Capture>;
  /** fetch data from the table: "transact_axle_capture" */
  transact_axle_capture: Array<Transact_Axle_Capture>;
  /** fetch aggregated fields from the table: "transact_axle_capture" */
  transact_axle_capture_aggregate: Transact_Axle_Capture_Aggregate;
  /** fetch data from the table: "transact_axle_capture" using primary key columns */
  transact_axle_capture_by_pk?: Maybe<Transact_Axle_Capture>;
  /** fetch data from the table in a streaming manner: "transact_axle_capture" */
  transact_axle_capture_stream: Array<Transact_Axle_Capture>;
  /** fetch data from the table: "transact_cctv" */
  transact_cctv: Array<Transact_Cctv>;
  /** fetch aggregated fields from the table: "transact_cctv" */
  transact_cctv_aggregate: Transact_Cctv_Aggregate;
  /** fetch data from the table: "transact_cctv" using primary key columns */
  transact_cctv_by_pk?: Maybe<Transact_Cctv>;
  /** fetch data from the table in a streaming manner: "transact_cctv" */
  transact_cctv_stream: Array<Transact_Cctv>;
  /** fetch data from the table: "transact_dimension" */
  transact_dimension: Array<Transact_Dimension>;
  /** fetch aggregated fields from the table: "transact_dimension" */
  transact_dimension_aggregate: Transact_Dimension_Aggregate;
  /** fetch data from the table: "transact_dimension" using primary key columns */
  transact_dimension_by_pk?: Maybe<Transact_Dimension>;
  /** fetch data from the table in a streaming manner: "transact_dimension" */
  transact_dimension_stream: Array<Transact_Dimension>;
  /** fetch data from the table: "transact_session_source" */
  transact_session_source: Array<Transact_Session_Source>;
  /** fetch aggregated fields from the table: "transact_session_source" */
  transact_session_source_aggregate: Transact_Session_Source_Aggregate;
  /** fetch data from the table: "transact_session_source" using primary key columns */
  transact_session_source_by_pk?: Maybe<Transact_Session_Source>;
  /** fetch data from the table in a streaming manner: "transact_session_source" */
  transact_session_source_stream: Array<Transact_Session_Source>;
  /** fetch data from the table: "transact_vehicle_actual" */
  transact_vehicle_actual: Array<Transact_Vehicle_Actual>;
  /** fetch aggregated fields from the table: "transact_vehicle_actual" */
  transact_vehicle_actual_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** fetch data from the table: "transact_vehicle_actual" using primary key columns */
  transact_vehicle_actual_by_pk?: Maybe<Transact_Vehicle_Actual>;
  /** fetch data from the table in a streaming manner: "transact_vehicle_actual" */
  transact_vehicle_actual_stream: Array<Transact_Vehicle_Actual>;
  /** fetch data from the table: "transact_vehicle_revision" */
  transact_vehicle_revision: Array<Transact_Vehicle_Revision>;
  /** fetch aggregated fields from the table: "transact_vehicle_revision" */
  transact_vehicle_revision_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** fetch data from the table: "transact_vehicle_revision" using primary key columns */
  transact_vehicle_revision_by_pk?: Maybe<Transact_Vehicle_Revision>;
  /** fetch data from the table in a streaming manner: "transact_vehicle_revision" */
  transact_vehicle_revision_stream: Array<Transact_Vehicle_Revision>;
  /** fetch data from the table: "transact_vehicle_status" */
  transact_vehicle_status: Array<Transact_Vehicle_Status>;
  /** fetch aggregated fields from the table: "transact_vehicle_status" */
  transact_vehicle_status_aggregate: Transact_Vehicle_Status_Aggregate;
  /** fetch data from the table: "transact_vehicle_status" using primary key columns */
  transact_vehicle_status_by_pk?: Maybe<Transact_Vehicle_Status>;
  /** fetch data from the table in a streaming manner: "transact_vehicle_status" */
  transact_vehicle_status_stream: Array<Transact_Vehicle_Status>;
  /** fetch data from the table: "transact_weighing" */
  transact_weighing: Array<Transact_Weighing>;
  /** fetch aggregated fields from the table: "transact_weighing" */
  transact_weighing_aggregate: Transact_Weighing_Aggregate;
  /** fetch data from the table: "transact_weighing" using primary key columns */
  transact_weighing_by_pk?: Maybe<Transact_Weighing>;
  /** fetch data from the table in a streaming manner: "transact_weighing" */
  transact_weighing_stream: Array<Transact_Weighing>;
  /** fetch data from the table: "transact_wim_session" */
  transact_wim_session: Array<Transact_Wim_Session>;
  /** fetch aggregated fields from the table: "transact_wim_session" */
  transact_wim_session_aggregate: Transact_Wim_Session_Aggregate;
  /** fetch data from the table: "transact_wim_session" using primary key columns */
  transact_wim_session_by_pk?: Maybe<Transact_Wim_Session>;
  /** fetch data from the table in a streaming manner: "transact_wim_session" */
  transact_wim_session_stream: Array<Transact_Wim_Session>;
  /** fetch data from the table: "user_login_history" */
  user_login_history: Array<User_Login_History>;
  /** fetch aggregated fields from the table: "user_login_history" */
  user_login_history_aggregate: User_Login_History_Aggregate;
  /** fetch data from the table: "user_login_history" using primary key columns */
  user_login_history_by_pk?: Maybe<User_Login_History>;
  /** fetch data from the table in a streaming manner: "user_login_history" */
  user_login_history_stream: Array<User_Login_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
};


export type Subscription_RootMaster_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


export type Subscription_RootMaster_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Config_Order_By>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


export type Subscription_RootMaster_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Config_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Config_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Config_Bool_Exp>;
};


export type Subscription_RootMaster_DeviceArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


export type Subscription_RootMaster_Device_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Order_By>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


export type Subscription_RootMaster_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Device_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Device_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Device_Bool_Exp>;
};


export type Subscription_RootMaster_Device_TypeArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Type_Order_By>>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};


export type Subscription_RootMaster_Device_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Device_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Device_Type_Order_By>>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};


export type Subscription_RootMaster_Device_Type_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Device_Type_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Device_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Device_Type_Bool_Exp>;
};


export type Subscription_RootMaster_RoleArgs = {
  distinct_on?: InputMaybe<Array<Master_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Role_Order_By>>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};


export type Subscription_RootMaster_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Role_Order_By>>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};


export type Subscription_RootMaster_Role_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Role_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Role_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Role_Bool_Exp>;
};


export type Subscription_RootMaster_SiteArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


export type Subscription_RootMaster_Site_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Site_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Site_Order_By>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


export type Subscription_RootMaster_Site_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Site_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Site_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Site_Bool_Exp>;
};


export type Subscription_RootMaster_UserArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


export type Subscription_RootMaster_User_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_User_Order_By>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


export type Subscription_RootMaster_User_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_User_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_User_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_User_Bool_Exp>;
};


export type Subscription_RootMaster_Vehicle_ClassArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


export type Subscription_RootMaster_Vehicle_Class_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Vehicle_Class_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Master_Vehicle_Class_Order_By>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


export type Subscription_RootMaster_Vehicle_Class_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMaster_Vehicle_Class_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Master_Vehicle_Class_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Vehicle_Class_Bool_Exp>;
};


export type Subscription_RootSystem_Runtime_ConfigArgs = {
  distinct_on?: InputMaybe<Array<System_Runtime_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Runtime_Config_Order_By>>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};


export type Subscription_RootSystem_Runtime_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Runtime_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Runtime_Config_Order_By>>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};


export type Subscription_RootSystem_Runtime_Config_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootSystem_Runtime_Config_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<System_Runtime_Config_Stream_Cursor_Input>>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};


export type Subscription_RootTransact_Anpr_CaptureArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_Anpr_Capture_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_Anpr_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Anpr_Capture_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Anpr_Capture_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_Axle_CaptureArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_Axle_Capture_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_Axle_Capture_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Axle_Capture_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Axle_Capture_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


export type Subscription_RootTransact_CctvArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


export type Subscription_RootTransact_Cctv_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


export type Subscription_RootTransact_Cctv_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Cctv_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Cctv_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


export type Subscription_RootTransact_DimensionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


export type Subscription_RootTransact_Dimension_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


export type Subscription_RootTransact_Dimension_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Dimension_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Dimension_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


export type Subscription_RootTransact_Session_SourceArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


export type Subscription_RootTransact_Session_Source_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


export type Subscription_RootTransact_Session_Source_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Session_Source_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Session_Source_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_ActualArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Actual_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Actual_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Vehicle_Actual_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Vehicle_Actual_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_RevisionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Revision_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Revision_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Vehicle_Revision_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Vehicle_Revision_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_StatusArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


export type Subscription_RootTransact_Vehicle_Status_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Vehicle_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Vehicle_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


export type Subscription_RootTransact_WeighingArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


export type Subscription_RootTransact_Weighing_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


export type Subscription_RootTransact_Weighing_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Weighing_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Weighing_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


export type Subscription_RootTransact_Wim_SessionArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


export type Subscription_RootTransact_Wim_Session_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Wim_Session_Order_By>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


export type Subscription_RootTransact_Wim_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransact_Wim_Session_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transact_Wim_Session_Stream_Cursor_Input>>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};


export type Subscription_RootUser_Login_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


export type Subscription_RootUser_Login_History_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Login_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Login_History_Order_By>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


export type Subscription_RootUser_Login_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Login_History_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Login_History_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** columns and relationships of "system_runtime_config" */
export type System_Runtime_Config = {
  config_group: Scalars['String']['output'];
  config_key: Scalars['String']['output'];
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  is_deleted: Scalars['Boolean']['output'];
  is_runtime_editable: Scalars['Boolean']['output'];
  is_secret: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date: Scalars['timestamptz']['output'];
  value_type: Scalars['String']['output'];
};

/** aggregated selection of "system_runtime_config" */
export type System_Runtime_Config_Aggregate = {
  aggregate?: Maybe<System_Runtime_Config_Aggregate_Fields>;
  nodes: Array<System_Runtime_Config>;
};

/** aggregate fields of "system_runtime_config" */
export type System_Runtime_Config_Aggregate_Fields = {
  avg?: Maybe<System_Runtime_Config_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<System_Runtime_Config_Max_Fields>;
  min?: Maybe<System_Runtime_Config_Min_Fields>;
  stddev?: Maybe<System_Runtime_Config_Stddev_Fields>;
  stddev_pop?: Maybe<System_Runtime_Config_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<System_Runtime_Config_Stddev_Samp_Fields>;
  sum?: Maybe<System_Runtime_Config_Sum_Fields>;
  var_pop?: Maybe<System_Runtime_Config_Var_Pop_Fields>;
  var_samp?: Maybe<System_Runtime_Config_Var_Samp_Fields>;
  variance?: Maybe<System_Runtime_Config_Variance_Fields>;
};


/** aggregate fields of "system_runtime_config" */
export type System_Runtime_Config_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<System_Runtime_Config_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type System_Runtime_Config_Avg_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "system_runtime_config". All fields are combined with a logical 'AND'. */
export type System_Runtime_Config_Bool_Exp = {
  _and?: InputMaybe<Array<System_Runtime_Config_Bool_Exp>>;
  _not?: InputMaybe<System_Runtime_Config_Bool_Exp>;
  _or?: InputMaybe<Array<System_Runtime_Config_Bool_Exp>>;
  config_group?: InputMaybe<String_Comparison_Exp>;
  config_key?: InputMaybe<String_Comparison_Exp>;
  config_value?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  is_runtime_editable?: InputMaybe<Boolean_Comparison_Exp>;
  is_secret?: InputMaybe<Boolean_Comparison_Exp>;
  label?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  value_type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "system_runtime_config" */
export enum System_Runtime_Config_Constraint {
  /** unique or primary key constraint on columns "config_group", "config_key" */
  SystemRuntimeConfigGroupKeyKey = 'system_runtime_config_group_key_key',
  /** unique or primary key constraint on columns "id" */
  SystemRuntimeConfigPkey = 'system_runtime_config_pkey',
  /** unique or primary key constraint on columns "config_key" */
  UqSystemRuntimeConfigKey = 'uq_system_runtime_config_key'
}

/** input type for incrementing numeric columns in table "system_runtime_config" */
export type System_Runtime_Config_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "system_runtime_config" */
export type System_Runtime_Config_Insert_Input = {
  config_group?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  is_runtime_editable?: InputMaybe<Scalars['Boolean']['input']>;
  is_secret?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  value_type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type System_Runtime_Config_Max_Fields = {
  config_group?: Maybe<Scalars['String']['output']>;
  config_key?: Maybe<Scalars['String']['output']>;
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  value_type?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type System_Runtime_Config_Min_Fields = {
  config_group?: Maybe<Scalars['String']['output']>;
  config_key?: Maybe<Scalars['String']['output']>;
  config_value?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  value_type?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "system_runtime_config" */
export type System_Runtime_Config_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<System_Runtime_Config>;
};

/** on_conflict condition type for table "system_runtime_config" */
export type System_Runtime_Config_On_Conflict = {
  constraint: System_Runtime_Config_Constraint;
  update_columns?: Array<System_Runtime_Config_Update_Column>;
  where?: InputMaybe<System_Runtime_Config_Bool_Exp>;
};

/** Ordering options when selecting data from "system_runtime_config". */
export type System_Runtime_Config_Order_By = {
  config_group?: InputMaybe<Order_By>;
  config_key?: InputMaybe<Order_By>;
  config_value?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  is_runtime_editable?: InputMaybe<Order_By>;
  is_secret?: InputMaybe<Order_By>;
  label?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  value_type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: system_runtime_config */
export type System_Runtime_Config_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "system_runtime_config" */
export enum System_Runtime_Config_Select_Column {
  /** column name */
  ConfigGroup = 'config_group',
  /** column name */
  ConfigKey = 'config_key',
  /** column name */
  ConfigValue = 'config_value',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsRuntimeEditable = 'is_runtime_editable',
  /** column name */
  IsSecret = 'is_secret',
  /** column name */
  Label = 'label',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  ValueType = 'value_type'
}

/** input type for updating data in table "system_runtime_config" */
export type System_Runtime_Config_Set_Input = {
  config_group?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  is_runtime_editable?: InputMaybe<Scalars['Boolean']['input']>;
  is_secret?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  value_type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type System_Runtime_Config_Stddev_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type System_Runtime_Config_Stddev_Pop_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type System_Runtime_Config_Stddev_Samp_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "system_runtime_config" */
export type System_Runtime_Config_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: System_Runtime_Config_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type System_Runtime_Config_Stream_Cursor_Value_Input = {
  config_group?: InputMaybe<Scalars['String']['input']>;
  config_key?: InputMaybe<Scalars['String']['input']>;
  config_value?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  is_runtime_editable?: InputMaybe<Scalars['Boolean']['input']>;
  is_secret?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  value_type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type System_Runtime_Config_Sum_Fields = {
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "system_runtime_config" */
export enum System_Runtime_Config_Update_Column {
  /** column name */
  ConfigGroup = 'config_group',
  /** column name */
  ConfigKey = 'config_key',
  /** column name */
  ConfigValue = 'config_value',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsRuntimeEditable = 'is_runtime_editable',
  /** column name */
  IsSecret = 'is_secret',
  /** column name */
  Label = 'label',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  ValueType = 'value_type'
}

export type System_Runtime_Config_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<System_Runtime_Config_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<System_Runtime_Config_Set_Input>;
  /** filter the rows which have to be updated */
  where: System_Runtime_Config_Bool_Exp;
};

/** aggregate var_pop on columns */
export type System_Runtime_Config_Var_Pop_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type System_Runtime_Config_Var_Samp_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type System_Runtime_Config_Variance_Fields = {
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "transact_anpr_capture" */
export type Transact_Anpr_Capture = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  confidence?: Maybe<Scalars['numeric']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  location_code?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_full_image_object?: Maybe<Scalars['String']['output']>;
  minio_plate_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this capture occurred */
  site_id: Scalars['uuid']['output'];
  /** An object relationship */
  transactWimSessionBySiteIdSessionId?: Maybe<Transact_Wim_Session>;
  /** An array relationship */
  transact_dimensions: Array<Transact_Dimension>;
  /** An aggregate relationship */
  transact_dimensions_aggregate: Transact_Dimension_Aggregate;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "transact_anpr_capture" */
export type Transact_Anpr_CaptureTransact_DimensionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** columns and relationships of "transact_anpr_capture" */
export type Transact_Anpr_CaptureTransact_Dimensions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** columns and relationships of "transact_anpr_capture" */
export type Transact_Anpr_CaptureTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "transact_anpr_capture" */
export type Transact_Anpr_CaptureTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** aggregated selection of "transact_anpr_capture" */
export type Transact_Anpr_Capture_Aggregate = {
  aggregate?: Maybe<Transact_Anpr_Capture_Aggregate_Fields>;
  nodes: Array<Transact_Anpr_Capture>;
};

export type Transact_Anpr_Capture_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp_Count>;
};

export type Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Anpr_Capture_Select_Column_Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Anpr_Capture_Select_Column_Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Anpr_Capture_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_anpr_capture" */
export type Transact_Anpr_Capture_Aggregate_Fields = {
  avg?: Maybe<Transact_Anpr_Capture_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Anpr_Capture_Max_Fields>;
  min?: Maybe<Transact_Anpr_Capture_Min_Fields>;
  stddev?: Maybe<Transact_Anpr_Capture_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Anpr_Capture_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Anpr_Capture_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Anpr_Capture_Sum_Fields>;
  var_pop?: Maybe<Transact_Anpr_Capture_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Anpr_Capture_Var_Samp_Fields>;
  variance?: Maybe<Transact_Anpr_Capture_Variance_Fields>;
};


/** aggregate fields of "transact_anpr_capture" */
export type Transact_Anpr_Capture_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Anpr_Capture_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Anpr_Capture_Max_Order_By>;
  min?: InputMaybe<Transact_Anpr_Capture_Min_Order_By>;
  stddev?: InputMaybe<Transact_Anpr_Capture_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Anpr_Capture_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Anpr_Capture_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Anpr_Capture_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Anpr_Capture_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Anpr_Capture_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Anpr_Capture_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Arr_Rel_Insert_Input = {
  data: Array<Transact_Anpr_Capture_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Anpr_Capture_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Anpr_Capture_Avg_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Avg_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_anpr_capture". All fields are combined with a logical 'AND'. */
export type Transact_Anpr_Capture_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Anpr_Capture_Bool_Exp>>;
  _not?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Anpr_Capture_Bool_Exp>>;
  camera_id?: InputMaybe<String_Comparison_Exp>;
  captured_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  confidence?: InputMaybe<Numeric_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  external_id?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  location_code?: InputMaybe<String_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  minio_bucket?: InputMaybe<String_Comparison_Exp>;
  minio_date_folder?: InputMaybe<String_Comparison_Exp>;
  minio_full_image_object?: InputMaybe<String_Comparison_Exp>;
  minio_plate_image_object?: InputMaybe<String_Comparison_Exp>;
  minio_xml_object?: InputMaybe<String_Comparison_Exp>;
  plate_no?: InputMaybe<String_Comparison_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Bool_Exp>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_anpr_capture" */
export enum Transact_Anpr_Capture_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactAnprCapturePkey = 'transact_anpr_capture_pkey',
  /** unique or primary key constraint on columns "external_id", "site_id" */
  UqAnprExternalSiteDevice = 'uq_anpr_external_site_device'
}

/** input type for incrementing numeric columns in table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Inc_Input = {
  confidence?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Insert_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  confidence?: InputMaybe<Scalars['numeric']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_code?: InputMaybe<Scalars['String']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_full_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_plate_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this capture occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Arr_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Anpr_Capture_Max_Fields = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  confidence?: Maybe<Scalars['numeric']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  location_code?: Maybe<Scalars['String']['output']>;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_full_image_object?: Maybe<Scalars['String']['output']>;
  minio_plate_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this capture occurred */
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Max_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  confidence?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  location_code?: InputMaybe<Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_full_image_object?: InputMaybe<Order_By>;
  minio_plate_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: InputMaybe<Order_By>;
  /** Site where this capture occurred */
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Anpr_Capture_Min_Fields = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  confidence?: Maybe<Scalars['numeric']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  location_code?: Maybe<Scalars['String']['output']>;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_full_image_object?: Maybe<Scalars['String']['output']>;
  minio_plate_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this capture occurred */
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Min_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  confidence?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  location_code?: InputMaybe<Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_full_image_object?: InputMaybe<Order_By>;
  minio_plate_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: InputMaybe<Order_By>;
  /** Site where this capture occurred */
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Anpr_Capture>;
};

/** input type for inserting object relation for remote table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Obj_Rel_Insert_Input = {
  data: Transact_Anpr_Capture_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Anpr_Capture_On_Conflict>;
};

/** on_conflict condition type for table "transact_anpr_capture" */
export type Transact_Anpr_Capture_On_Conflict = {
  constraint: Transact_Anpr_Capture_Constraint;
  update_columns?: Array<Transact_Anpr_Capture_Update_Column>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_anpr_capture". */
export type Transact_Anpr_Capture_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  confidence?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  location_code?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_full_image_object?: InputMaybe<Order_By>;
  minio_plate_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_anpr_capture */
export type Transact_Anpr_Capture_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_anpr_capture" */
export enum Transact_Anpr_Capture_Select_Column {
  /** column name */
  CameraId = 'camera_id',
  /** column name */
  CapturedAt = 'captured_at',
  /** column name */
  Confidence = 'confidence',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  ExternalId = 'external_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LocationCode = 'location_code',
  /** column name */
  MinioBucket = 'minio_bucket',
  /** column name */
  MinioDateFolder = 'minio_date_folder',
  /** column name */
  MinioFullImageObject = 'minio_full_image_object',
  /** column name */
  MinioPlateImageObject = 'minio_plate_image_object',
  /** column name */
  MinioXmlObject = 'minio_xml_object',
  /** column name */
  PlateNo = 'plate_no',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_anpr_capture_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_anpr_capture" */
export enum Transact_Anpr_Capture_Select_Column_Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_anpr_capture_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_anpr_capture" */
export enum Transact_Anpr_Capture_Select_Column_Transact_Anpr_Capture_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Set_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  confidence?: InputMaybe<Scalars['numeric']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_code?: InputMaybe<Scalars['String']['input']>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_full_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_plate_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this capture occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Anpr_Capture_Stddev_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Stddev_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Anpr_Capture_Stddev_Pop_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Stddev_Pop_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Anpr_Capture_Stddev_Samp_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Stddev_Samp_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Anpr_Capture_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Anpr_Capture_Stream_Cursor_Value_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  confidence?: InputMaybe<Scalars['numeric']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_code?: InputMaybe<Scalars['String']['input']>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_full_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_plate_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this capture occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Transact_Anpr_Capture_Sum_Fields = {
  confidence?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Sum_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** update columns of table "transact_anpr_capture" */
export enum Transact_Anpr_Capture_Update_Column {
  /** column name */
  CameraId = 'camera_id',
  /** column name */
  CapturedAt = 'captured_at',
  /** column name */
  Confidence = 'confidence',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  ExternalId = 'external_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LocationCode = 'location_code',
  /** column name */
  MinioBucket = 'minio_bucket',
  /** column name */
  MinioDateFolder = 'minio_date_folder',
  /** column name */
  MinioFullImageObject = 'minio_full_image_object',
  /** column name */
  MinioPlateImageObject = 'minio_plate_image_object',
  /** column name */
  MinioXmlObject = 'minio_xml_object',
  /** column name */
  PlateNo = 'plate_no',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Anpr_Capture_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Anpr_Capture_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Anpr_Capture_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Anpr_Capture_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Anpr_Capture_Var_Pop_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Var_Pop_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Anpr_Capture_Var_Samp_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Var_Samp_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Anpr_Capture_Variance_Fields = {
  confidence?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_anpr_capture" */
export type Transact_Anpr_Capture_Variance_Order_By = {
  confidence?: InputMaybe<Order_By>;
};

/** columns and relationships of "transact_axle_capture" */
export type Transact_Axle_Capture = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  length_mm?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this measurement occurred */
  site_id: Scalars['uuid']['output'];
  total_axles?: Maybe<Scalars['Int']['output']>;
  total_wheels?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  transactWimSessionBySiteIdSessionId?: Maybe<Transact_Wim_Session>;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  vehicle_body_type?: Maybe<Scalars['String']['output']>;
  vehicle_category?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "transact_axle_capture" */
export type Transact_Axle_CaptureTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "transact_axle_capture" */
export type Transact_Axle_CaptureTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** aggregated selection of "transact_axle_capture" */
export type Transact_Axle_Capture_Aggregate = {
  aggregate?: Maybe<Transact_Axle_Capture_Aggregate_Fields>;
  nodes: Array<Transact_Axle_Capture>;
};

export type Transact_Axle_Capture_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp_Count>;
};

export type Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Axle_Capture_Select_Column_Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Axle_Capture_Select_Column_Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Axle_Capture_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_axle_capture" */
export type Transact_Axle_Capture_Aggregate_Fields = {
  avg?: Maybe<Transact_Axle_Capture_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Axle_Capture_Max_Fields>;
  min?: Maybe<Transact_Axle_Capture_Min_Fields>;
  stddev?: Maybe<Transact_Axle_Capture_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Axle_Capture_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Axle_Capture_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Axle_Capture_Sum_Fields>;
  var_pop?: Maybe<Transact_Axle_Capture_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Axle_Capture_Var_Samp_Fields>;
  variance?: Maybe<Transact_Axle_Capture_Variance_Fields>;
};


/** aggregate fields of "transact_axle_capture" */
export type Transact_Axle_Capture_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_axle_capture" */
export type Transact_Axle_Capture_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Axle_Capture_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Axle_Capture_Max_Order_By>;
  min?: InputMaybe<Transact_Axle_Capture_Min_Order_By>;
  stddev?: InputMaybe<Transact_Axle_Capture_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Axle_Capture_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Axle_Capture_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Axle_Capture_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Axle_Capture_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Axle_Capture_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Axle_Capture_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "transact_axle_capture" */
export type Transact_Axle_Capture_Arr_Rel_Insert_Input = {
  data: Array<Transact_Axle_Capture_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Axle_Capture_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Axle_Capture_Avg_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Avg_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_axle_capture". All fields are combined with a logical 'AND'. */
export type Transact_Axle_Capture_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Axle_Capture_Bool_Exp>>;
  _not?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Axle_Capture_Bool_Exp>>;
  camera_id?: InputMaybe<String_Comparison_Exp>;
  captured_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  external_id?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  length_mm?: InputMaybe<Int_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  minio_bucket?: InputMaybe<String_Comparison_Exp>;
  minio_date_folder?: InputMaybe<String_Comparison_Exp>;
  minio_image_object?: InputMaybe<String_Comparison_Exp>;
  minio_xml_object?: InputMaybe<String_Comparison_Exp>;
  plate_no?: InputMaybe<String_Comparison_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  total_axles?: InputMaybe<Int_Comparison_Exp>;
  total_wheels?: InputMaybe<Int_Comparison_Exp>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  vehicle_body_type?: InputMaybe<String_Comparison_Exp>;
  vehicle_category?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_axle_capture" */
export enum Transact_Axle_Capture_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactAxleCapturePkey = 'transact_axle_capture_pkey',
  /** unique or primary key constraint on columns "external_id", "site_id" */
  UqAxleExternalSiteDevice = 'uq_axle_external_site_device'
}

/** input type for incrementing numeric columns in table "transact_axle_capture" */
export type Transact_Axle_Capture_Inc_Input = {
  length_mm?: InputMaybe<Scalars['Int']['input']>;
  total_axles?: InputMaybe<Scalars['Int']['input']>;
  total_wheels?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "transact_axle_capture" */
export type Transact_Axle_Capture_Insert_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length_mm?: InputMaybe<Scalars['Int']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this measurement occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axles?: InputMaybe<Scalars['Int']['input']>;
  total_wheels?: InputMaybe<Scalars['Int']['input']>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  vehicle_body_type?: InputMaybe<Scalars['String']['input']>;
  vehicle_category?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Transact_Axle_Capture_Max_Fields = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  length_mm?: Maybe<Scalars['Int']['output']>;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this measurement occurred */
  site_id?: Maybe<Scalars['uuid']['output']>;
  total_axles?: Maybe<Scalars['Int']['output']>;
  total_wheels?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  vehicle_body_type?: Maybe<Scalars['String']['output']>;
  vehicle_category?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Max_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  length_mm?: InputMaybe<Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: InputMaybe<Order_By>;
  /** Site where this measurement occurred */
  site_id?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  vehicle_body_type?: InputMaybe<Order_By>;
  vehicle_category?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Axle_Capture_Min_Fields = {
  camera_id?: Maybe<Scalars['String']['output']>;
  captured_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  length_mm?: Maybe<Scalars['Int']['output']>;
  minio_bucket?: Maybe<Scalars['String']['output']>;
  minio_date_folder?: Maybe<Scalars['String']['output']>;
  minio_image_object?: Maybe<Scalars['String']['output']>;
  minio_xml_object?: Maybe<Scalars['String']['output']>;
  plate_no?: Maybe<Scalars['String']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  /** Site where this measurement occurred */
  site_id?: Maybe<Scalars['uuid']['output']>;
  total_axles?: Maybe<Scalars['Int']['output']>;
  total_wheels?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  vehicle_body_type?: Maybe<Scalars['String']['output']>;
  vehicle_category?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Min_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  length_mm?: InputMaybe<Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: InputMaybe<Order_By>;
  /** Site where this measurement occurred */
  site_id?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  vehicle_body_type?: InputMaybe<Order_By>;
  vehicle_category?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_axle_capture" */
export type Transact_Axle_Capture_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Axle_Capture>;
};

/** input type for inserting object relation for remote table "transact_axle_capture" */
export type Transact_Axle_Capture_Obj_Rel_Insert_Input = {
  data: Transact_Axle_Capture_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Axle_Capture_On_Conflict>;
};

/** on_conflict condition type for table "transact_axle_capture" */
export type Transact_Axle_Capture_On_Conflict = {
  constraint: Transact_Axle_Capture_Constraint;
  update_columns?: Array<Transact_Axle_Capture_Update_Column>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_axle_capture". */
export type Transact_Axle_Capture_Order_By = {
  camera_id?: InputMaybe<Order_By>;
  captured_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  external_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  length_mm?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  minio_bucket?: InputMaybe<Order_By>;
  minio_date_folder?: InputMaybe<Order_By>;
  minio_image_object?: InputMaybe<Order_By>;
  minio_xml_object?: InputMaybe<Order_By>;
  plate_no?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  vehicle_body_type?: InputMaybe<Order_By>;
  vehicle_category?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_axle_capture */
export type Transact_Axle_Capture_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_axle_capture" */
export enum Transact_Axle_Capture_Select_Column {
  /** column name */
  CameraId = 'camera_id',
  /** column name */
  CapturedAt = 'captured_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  ExternalId = 'external_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LengthMm = 'length_mm',
  /** column name */
  MinioBucket = 'minio_bucket',
  /** column name */
  MinioDateFolder = 'minio_date_folder',
  /** column name */
  MinioImageObject = 'minio_image_object',
  /** column name */
  MinioXmlObject = 'minio_xml_object',
  /** column name */
  PlateNo = 'plate_no',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TotalAxles = 'total_axles',
  /** column name */
  TotalWheels = 'total_wheels',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  VehicleBodyType = 'vehicle_body_type',
  /** column name */
  VehicleCategory = 'vehicle_category'
}

/** select "transact_axle_capture_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_axle_capture" */
export enum Transact_Axle_Capture_Select_Column_Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_axle_capture_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_axle_capture" */
export enum Transact_Axle_Capture_Select_Column_Transact_Axle_Capture_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_axle_capture" */
export type Transact_Axle_Capture_Set_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length_mm?: InputMaybe<Scalars['Int']['input']>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this measurement occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axles?: InputMaybe<Scalars['Int']['input']>;
  total_wheels?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  vehicle_body_type?: InputMaybe<Scalars['String']['input']>;
  vehicle_category?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Axle_Capture_Stddev_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Stddev_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Axle_Capture_Stddev_Pop_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Stddev_Pop_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Axle_Capture_Stddev_Samp_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Stddev_Samp_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_axle_capture" */
export type Transact_Axle_Capture_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Axle_Capture_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Axle_Capture_Stream_Cursor_Value_Input = {
  camera_id?: InputMaybe<Scalars['String']['input']>;
  captured_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length_mm?: InputMaybe<Scalars['Int']['input']>;
  minio_bucket?: InputMaybe<Scalars['String']['input']>;
  minio_date_folder?: InputMaybe<Scalars['String']['input']>;
  minio_image_object?: InputMaybe<Scalars['String']['input']>;
  minio_xml_object?: InputMaybe<Scalars['String']['input']>;
  plate_no?: InputMaybe<Scalars['String']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Site where this measurement occurred */
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axles?: InputMaybe<Scalars['Int']['input']>;
  total_wheels?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  vehicle_body_type?: InputMaybe<Scalars['String']['input']>;
  vehicle_category?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Transact_Axle_Capture_Sum_Fields = {
  length_mm?: Maybe<Scalars['Int']['output']>;
  total_axles?: Maybe<Scalars['Int']['output']>;
  total_wheels?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Sum_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** update columns of table "transact_axle_capture" */
export enum Transact_Axle_Capture_Update_Column {
  /** column name */
  CameraId = 'camera_id',
  /** column name */
  CapturedAt = 'captured_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  ExternalId = 'external_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LengthMm = 'length_mm',
  /** column name */
  MinioBucket = 'minio_bucket',
  /** column name */
  MinioDateFolder = 'minio_date_folder',
  /** column name */
  MinioImageObject = 'minio_image_object',
  /** column name */
  MinioXmlObject = 'minio_xml_object',
  /** column name */
  PlateNo = 'plate_no',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TotalAxles = 'total_axles',
  /** column name */
  TotalWheels = 'total_wheels',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  VehicleBodyType = 'vehicle_body_type',
  /** column name */
  VehicleCategory = 'vehicle_category'
}

export type Transact_Axle_Capture_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Axle_Capture_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Axle_Capture_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Axle_Capture_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Axle_Capture_Var_Pop_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Var_Pop_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Axle_Capture_Var_Samp_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Var_Samp_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Axle_Capture_Variance_Fields = {
  length_mm?: Maybe<Scalars['Float']['output']>;
  total_axles?: Maybe<Scalars['Float']['output']>;
  total_wheels?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_axle_capture" */
export type Transact_Axle_Capture_Variance_Order_By = {
  length_mm?: InputMaybe<Order_By>;
  total_axles?: InputMaybe<Order_By>;
  total_wheels?: InputMaybe<Order_By>;
};

/** columns and relationships of "transact_cctv" */
export type Transact_Cctv = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id: Scalars['uuid']['output'];
  /** An object relationship */
  transactWimSessionBySessionIdSiteId?: Maybe<Transact_Wim_Session>;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "transact_cctv" */
export type Transact_CctvTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "transact_cctv" */
export type Transact_CctvTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** aggregated selection of "transact_cctv" */
export type Transact_Cctv_Aggregate = {
  aggregate?: Maybe<Transact_Cctv_Aggregate_Fields>;
  nodes: Array<Transact_Cctv>;
};

export type Transact_Cctv_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp_Count>;
};

export type Transact_Cctv_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Cctv_Select_Column_Transact_Cctv_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Cctv_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Cctv_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Cctv_Select_Column_Transact_Cctv_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Cctv_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Cctv_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Cctv_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_cctv" */
export type Transact_Cctv_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Cctv_Max_Fields>;
  min?: Maybe<Transact_Cctv_Min_Fields>;
};


/** aggregate fields of "transact_cctv" */
export type Transact_Cctv_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_cctv" */
export type Transact_Cctv_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Cctv_Max_Order_By>;
  min?: InputMaybe<Transact_Cctv_Min_Order_By>;
};

/** input type for inserting array relation for remote table "transact_cctv" */
export type Transact_Cctv_Arr_Rel_Insert_Input = {
  data: Array<Transact_Cctv_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Cctv_On_Conflict>;
};

/** Boolean expression to filter rows from the table "transact_cctv". All fields are combined with a logical 'AND'. */
export type Transact_Cctv_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Cctv_Bool_Exp>>;
  _not?: InputMaybe<Transact_Cctv_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Cctv_Bool_Exp>>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  filename?: InputMaybe<String_Comparison_Exp>;
  filepath?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_cctv" */
export enum Transact_Cctv_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactCctvPkey = 'transact_cctv_pkey'
}

/** input type for inserting data into table "transact_cctv" */
export type Transact_Cctv_Insert_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Cctv_Max_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_cctv" */
export type Transact_Cctv_Max_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filename?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Cctv_Min_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_cctv" */
export type Transact_Cctv_Min_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filename?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_cctv" */
export type Transact_Cctv_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Cctv>;
};

/** input type for inserting object relation for remote table "transact_cctv" */
export type Transact_Cctv_Obj_Rel_Insert_Input = {
  data: Transact_Cctv_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Cctv_On_Conflict>;
};

/** on_conflict condition type for table "transact_cctv" */
export type Transact_Cctv_On_Conflict = {
  constraint: Transact_Cctv_Constraint;
  update_columns?: Array<Transact_Cctv_Update_Column>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_cctv". */
export type Transact_Cctv_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filename?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_cctv */
export type Transact_Cctv_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_cctv" */
export enum Transact_Cctv_Select_Column {
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Filename = 'filename',
  /** column name */
  Filepath = 'filepath',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_cctv_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_cctv" */
export enum Transact_Cctv_Select_Column_Transact_Cctv_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_cctv_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_cctv" */
export enum Transact_Cctv_Select_Column_Transact_Cctv_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_cctv" */
export type Transact_Cctv_Set_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "transact_cctv" */
export type Transact_Cctv_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Cctv_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Cctv_Stream_Cursor_Value_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** WIM session ID when this CCTV capture was processed */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "transact_cctv" */
export enum Transact_Cctv_Update_Column {
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Filename = 'filename',
  /** column name */
  Filepath = 'filepath',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Cctv_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Cctv_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Cctv_Bool_Exp;
};

/** columns and relationships of "transact_dimension" */
export type Transact_Dimension = {
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id: Scalars['uuid']['output'];
  /** An object relationship */
  transactWimSessionBySessionIdSiteId?: Maybe<Transact_Wim_Session>;
  /** An object relationship */
  transact_anpr_capture?: Maybe<Transact_Anpr_Capture>;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};


/** columns and relationships of "transact_dimension" */
export type Transact_DimensionTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "transact_dimension" */
export type Transact_DimensionTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** aggregated selection of "transact_dimension" */
export type Transact_Dimension_Aggregate = {
  aggregate?: Maybe<Transact_Dimension_Aggregate_Fields>;
  nodes: Array<Transact_Dimension>;
};

export type Transact_Dimension_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp_Count>;
};

export type Transact_Dimension_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Dimension_Select_Column_Transact_Dimension_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Dimension_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Dimension_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Dimension_Select_Column_Transact_Dimension_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Dimension_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Dimension_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Dimension_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_dimension" */
export type Transact_Dimension_Aggregate_Fields = {
  avg?: Maybe<Transact_Dimension_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Dimension_Max_Fields>;
  min?: Maybe<Transact_Dimension_Min_Fields>;
  stddev?: Maybe<Transact_Dimension_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Dimension_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Dimension_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Dimension_Sum_Fields>;
  var_pop?: Maybe<Transact_Dimension_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Dimension_Var_Samp_Fields>;
  variance?: Maybe<Transact_Dimension_Variance_Fields>;
};


/** aggregate fields of "transact_dimension" */
export type Transact_Dimension_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_dimension" */
export type Transact_Dimension_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Dimension_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Dimension_Max_Order_By>;
  min?: InputMaybe<Transact_Dimension_Min_Order_By>;
  stddev?: InputMaybe<Transact_Dimension_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Dimension_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Dimension_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Dimension_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Dimension_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Dimension_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Dimension_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "transact_dimension" */
export type Transact_Dimension_Arr_Rel_Insert_Input = {
  data: Array<Transact_Dimension_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Dimension_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Dimension_Avg_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_dimension" */
export type Transact_Dimension_Avg_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_dimension". All fields are combined with a logical 'AND'. */
export type Transact_Dimension_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Dimension_Bool_Exp>>;
  _not?: InputMaybe<Transact_Dimension_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Dimension_Bool_Exp>>;
  anpr_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  filepath?: InputMaybe<String_Comparison_Exp>;
  height?: InputMaybe<Numeric_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  length?: InputMaybe<Numeric_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  width?: InputMaybe<Numeric_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_dimension" */
export enum Transact_Dimension_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactDimensionPkey = 'transact_dimension_pkey'
}

/** input type for incrementing numeric columns in table "transact_dimension" */
export type Transact_Dimension_Inc_Input = {
  height?: InputMaybe<Scalars['numeric']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "transact_dimension" */
export type Transact_Dimension_Insert_Input = {
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Obj_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate max on columns */
export type Transact_Dimension_Max_Fields = {
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by max() on columns of table "transact_dimension" */
export type Transact_Dimension_Max_Order_By = {
  anpr_id?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Dimension_Min_Fields = {
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  filepath?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['numeric']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by min() on columns of table "transact_dimension" */
export type Transact_Dimension_Min_Order_By = {
  anpr_id?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_dimension" */
export type Transact_Dimension_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Dimension>;
};

/** input type for inserting object relation for remote table "transact_dimension" */
export type Transact_Dimension_Obj_Rel_Insert_Input = {
  data: Transact_Dimension_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Dimension_On_Conflict>;
};

/** on_conflict condition type for table "transact_dimension" */
export type Transact_Dimension_On_Conflict = {
  constraint: Transact_Dimension_Constraint;
  update_columns?: Array<Transact_Dimension_Update_Column>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_dimension". */
export type Transact_Dimension_Order_By = {
  anpr_id?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  filepath?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_dimension */
export type Transact_Dimension_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_dimension" */
export enum Transact_Dimension_Select_Column {
  /** column name */
  AnprId = 'anpr_id',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Filepath = 'filepath',
  /** column name */
  Height = 'height',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Length = 'length',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Width = 'width'
}

/** select "transact_dimension_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_dimension" */
export enum Transact_Dimension_Select_Column_Transact_Dimension_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_dimension_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_dimension" */
export enum Transact_Dimension_Select_Column_Transact_Dimension_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_dimension" */
export type Transact_Dimension_Set_Input = {
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Dimension_Stddev_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_dimension" */
export type Transact_Dimension_Stddev_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Dimension_Stddev_Pop_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_dimension" */
export type Transact_Dimension_Stddev_Pop_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Dimension_Stddev_Samp_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_dimension" */
export type Transact_Dimension_Stddev_Samp_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_dimension" */
export type Transact_Dimension_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Dimension_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Dimension_Stream_Cursor_Value_Input = {
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  filepath?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['numeric']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['numeric']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when dimension is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  width?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate sum on columns */
export type Transact_Dimension_Sum_Fields = {
  height?: Maybe<Scalars['numeric']['output']>;
  length?: Maybe<Scalars['numeric']['output']>;
  width?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "transact_dimension" */
export type Transact_Dimension_Sum_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** update columns of table "transact_dimension" */
export enum Transact_Dimension_Update_Column {
  /** column name */
  AnprId = 'anpr_id',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Filepath = 'filepath',
  /** column name */
  Height = 'height',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Length = 'length',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  Width = 'width'
}

export type Transact_Dimension_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Dimension_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Dimension_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Dimension_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Dimension_Var_Pop_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_dimension" */
export type Transact_Dimension_Var_Pop_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Dimension_Var_Samp_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_dimension" */
export type Transact_Dimension_Var_Samp_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Dimension_Variance_Fields = {
  height?: Maybe<Scalars['Float']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_dimension" */
export type Transact_Dimension_Variance_Order_By = {
  height?: InputMaybe<Order_By>;
  length?: InputMaybe<Order_By>;
  width?: InputMaybe<Order_By>;
};

/** Independent per-device source state for a WIM session; missing data is a valid timeout/failed outcome. */
export type Transact_Session_Source = {
  attempt_count: Scalars['Int']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date: Scalars['timestamptz']['output'];
  device_id?: Maybe<Scalars['uuid']['output']>;
  error_code?: Maybe<Scalars['String']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  is_deleted: Scalars['Boolean']['output'];
  last_attempt_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  masterUserByUpdatedBy?: Maybe<Master_User>;
  /** An object relationship */
  master_device?: Maybe<Master_Device>;
  /** An object relationship */
  master_site: Master_Site;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  metadata: Scalars['jsonb']['output'];
  received_at?: Maybe<Scalars['timestamptz']['output']>;
  session_id: Scalars['uuid']['output'];
  site_id: Scalars['uuid']['output'];
  source_mode: Scalars['String']['output'];
  source_record_id?: Maybe<Scalars['uuid']['output']>;
  source_status: Scalars['String']['output'];
  source_type: Scalars['String']['output'];
  timeout_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  transactWimSessionBySessionIdSiteId?: Maybe<Transact_Wim_Session>;
  /** An object relationship */
  transact_wim_session: Transact_Wim_Session;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date: Scalars['timestamptz']['output'];
};


/** Independent per-device source state for a WIM session; missing data is a valid timeout/failed outcome. */
export type Transact_Session_SourceMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "transact_session_source" */
export type Transact_Session_Source_Aggregate = {
  aggregate?: Maybe<Transact_Session_Source_Aggregate_Fields>;
  nodes: Array<Transact_Session_Source>;
};

export type Transact_Session_Source_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp_Count>;
};

export type Transact_Session_Source_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Session_Source_Select_Column_Transact_Session_Source_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Session_Source_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Session_Source_Select_Column_Transact_Session_Source_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Session_Source_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_session_source" */
export type Transact_Session_Source_Aggregate_Fields = {
  avg?: Maybe<Transact_Session_Source_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Session_Source_Max_Fields>;
  min?: Maybe<Transact_Session_Source_Min_Fields>;
  stddev?: Maybe<Transact_Session_Source_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Session_Source_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Session_Source_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Session_Source_Sum_Fields>;
  var_pop?: Maybe<Transact_Session_Source_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Session_Source_Var_Samp_Fields>;
  variance?: Maybe<Transact_Session_Source_Variance_Fields>;
};


/** aggregate fields of "transact_session_source" */
export type Transact_Session_Source_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_session_source" */
export type Transact_Session_Source_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Session_Source_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Session_Source_Max_Order_By>;
  min?: InputMaybe<Transact_Session_Source_Min_Order_By>;
  stddev?: InputMaybe<Transact_Session_Source_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Session_Source_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Session_Source_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Session_Source_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Session_Source_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Session_Source_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Session_Source_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Transact_Session_Source_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "transact_session_source" */
export type Transact_Session_Source_Arr_Rel_Insert_Input = {
  data: Array<Transact_Session_Source_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Session_Source_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Session_Source_Avg_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_session_source" */
export type Transact_Session_Source_Avg_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_session_source". All fields are combined with a logical 'AND'. */
export type Transact_Session_Source_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Session_Source_Bool_Exp>>;
  _not?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Session_Source_Bool_Exp>>;
  attempt_count?: InputMaybe<Int_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  device_id?: InputMaybe<Uuid_Comparison_Exp>;
  error_code?: InputMaybe<String_Comparison_Exp>;
  error_message?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  last_attempt_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Bool_Exp>;
  master_device?: InputMaybe<Master_Device_Bool_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  received_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  source_mode?: InputMaybe<String_Comparison_Exp>;
  source_record_id?: InputMaybe<Uuid_Comparison_Exp>;
  source_status?: InputMaybe<String_Comparison_Exp>;
  source_type?: InputMaybe<String_Comparison_Exp>;
  timeout_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_session_source" */
export enum Transact_Session_Source_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactSessionSourcePkey = 'transact_session_source_pkey',
  /** unique or primary key constraint on columns "source_type", "site_id", "session_id" */
  UqTransactSessionSource = 'uq_transact_session_source'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Transact_Session_Source_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Transact_Session_Source_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Transact_Session_Source_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "transact_session_source" */
export type Transact_Session_Source_Inc_Input = {
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "transact_session_source" */
export type Transact_Session_Source_Insert_Input = {
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['uuid']['input']>;
  error_code?: InputMaybe<Scalars['String']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  last_attempt_at?: InputMaybe<Scalars['timestamptz']['input']>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  master_device?: InputMaybe<Master_Device_Obj_Rel_Insert_Input>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  received_at?: InputMaybe<Scalars['timestamptz']['input']>;
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  source_mode?: InputMaybe<Scalars['String']['input']>;
  source_record_id?: InputMaybe<Scalars['uuid']['input']>;
  source_status?: InputMaybe<Scalars['String']['input']>;
  source_type?: InputMaybe<Scalars['String']['input']>;
  timeout_at?: InputMaybe<Scalars['timestamptz']['input']>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Session_Source_Max_Fields = {
  attempt_count?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  device_id?: Maybe<Scalars['uuid']['output']>;
  error_code?: Maybe<Scalars['String']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_attempt_at?: Maybe<Scalars['timestamptz']['output']>;
  received_at?: Maybe<Scalars['timestamptz']['output']>;
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  source_mode?: Maybe<Scalars['String']['output']>;
  source_record_id?: Maybe<Scalars['uuid']['output']>;
  source_status?: Maybe<Scalars['String']['output']>;
  source_type?: Maybe<Scalars['String']['output']>;
  timeout_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_session_source" */
export type Transact_Session_Source_Max_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_id?: InputMaybe<Order_By>;
  error_code?: InputMaybe<Order_By>;
  error_message?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_attempt_at?: InputMaybe<Order_By>;
  received_at?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  source_mode?: InputMaybe<Order_By>;
  source_record_id?: InputMaybe<Order_By>;
  source_status?: InputMaybe<Order_By>;
  source_type?: InputMaybe<Order_By>;
  timeout_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Session_Source_Min_Fields = {
  attempt_count?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  device_id?: Maybe<Scalars['uuid']['output']>;
  error_code?: Maybe<Scalars['String']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_attempt_at?: Maybe<Scalars['timestamptz']['output']>;
  received_at?: Maybe<Scalars['timestamptz']['output']>;
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  source_mode?: Maybe<Scalars['String']['output']>;
  source_record_id?: Maybe<Scalars['uuid']['output']>;
  source_status?: Maybe<Scalars['String']['output']>;
  source_type?: Maybe<Scalars['String']['output']>;
  timeout_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_session_source" */
export type Transact_Session_Source_Min_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_id?: InputMaybe<Order_By>;
  error_code?: InputMaybe<Order_By>;
  error_message?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_attempt_at?: InputMaybe<Order_By>;
  received_at?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  source_mode?: InputMaybe<Order_By>;
  source_record_id?: InputMaybe<Order_By>;
  source_status?: InputMaybe<Order_By>;
  source_type?: InputMaybe<Order_By>;
  timeout_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_session_source" */
export type Transact_Session_Source_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Session_Source>;
};

/** on_conflict condition type for table "transact_session_source" */
export type Transact_Session_Source_On_Conflict = {
  constraint: Transact_Session_Source_Constraint;
  update_columns?: Array<Transact_Session_Source_Update_Column>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_session_source". */
export type Transact_Session_Source_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_id?: InputMaybe<Order_By>;
  error_code?: InputMaybe<Order_By>;
  error_message?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  last_attempt_at?: InputMaybe<Order_By>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Order_By>;
  master_device?: InputMaybe<Master_Device_Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  metadata?: InputMaybe<Order_By>;
  received_at?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  source_mode?: InputMaybe<Order_By>;
  source_record_id?: InputMaybe<Order_By>;
  source_status?: InputMaybe<Order_By>;
  source_type?: InputMaybe<Order_By>;
  timeout_at?: InputMaybe<Order_By>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_session_source */
export type Transact_Session_Source_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Transact_Session_Source_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "transact_session_source" */
export enum Transact_Session_Source_Select_Column {
  /** column name */
  AttemptCount = 'attempt_count',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DeviceId = 'device_id',
  /** column name */
  ErrorCode = 'error_code',
  /** column name */
  ErrorMessage = 'error_message',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LastAttemptAt = 'last_attempt_at',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  ReceivedAt = 'received_at',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  SourceMode = 'source_mode',
  /** column name */
  SourceRecordId = 'source_record_id',
  /** column name */
  SourceStatus = 'source_status',
  /** column name */
  SourceType = 'source_type',
  /** column name */
  TimeoutAt = 'timeout_at',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_session_source_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_session_source" */
export enum Transact_Session_Source_Select_Column_Transact_Session_Source_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_session_source_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_session_source" */
export enum Transact_Session_Source_Select_Column_Transact_Session_Source_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_session_source" */
export type Transact_Session_Source_Set_Input = {
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['uuid']['input']>;
  error_code?: InputMaybe<Scalars['String']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  last_attempt_at?: InputMaybe<Scalars['timestamptz']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  received_at?: InputMaybe<Scalars['timestamptz']['input']>;
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  source_mode?: InputMaybe<Scalars['String']['input']>;
  source_record_id?: InputMaybe<Scalars['uuid']['input']>;
  source_status?: InputMaybe<Scalars['String']['input']>;
  source_type?: InputMaybe<Scalars['String']['input']>;
  timeout_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Session_Source_Stddev_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_session_source" */
export type Transact_Session_Source_Stddev_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Session_Source_Stddev_Pop_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_session_source" */
export type Transact_Session_Source_Stddev_Pop_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Session_Source_Stddev_Samp_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_session_source" */
export type Transact_Session_Source_Stddev_Samp_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_session_source" */
export type Transact_Session_Source_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Session_Source_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Session_Source_Stream_Cursor_Value_Input = {
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['uuid']['input']>;
  error_code?: InputMaybe<Scalars['String']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  last_attempt_at?: InputMaybe<Scalars['timestamptz']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  received_at?: InputMaybe<Scalars['timestamptz']['input']>;
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  source_mode?: InputMaybe<Scalars['String']['input']>;
  source_record_id?: InputMaybe<Scalars['uuid']['input']>;
  source_status?: InputMaybe<Scalars['String']['input']>;
  source_type?: InputMaybe<Scalars['String']['input']>;
  timeout_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Transact_Session_Source_Sum_Fields = {
  attempt_count?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "transact_session_source" */
export type Transact_Session_Source_Sum_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** update columns of table "transact_session_source" */
export enum Transact_Session_Source_Update_Column {
  /** column name */
  AttemptCount = 'attempt_count',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DeviceId = 'device_id',
  /** column name */
  ErrorCode = 'error_code',
  /** column name */
  ErrorMessage = 'error_message',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LastAttemptAt = 'last_attempt_at',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  ReceivedAt = 'received_at',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  SourceMode = 'source_mode',
  /** column name */
  SourceRecordId = 'source_record_id',
  /** column name */
  SourceStatus = 'source_status',
  /** column name */
  SourceType = 'source_type',
  /** column name */
  TimeoutAt = 'timeout_at',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Session_Source_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Transact_Session_Source_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Transact_Session_Source_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Transact_Session_Source_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Transact_Session_Source_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Session_Source_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Transact_Session_Source_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Session_Source_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Session_Source_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Session_Source_Var_Pop_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_session_source" */
export type Transact_Session_Source_Var_Pop_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Session_Source_Var_Samp_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_session_source" */
export type Transact_Session_Source_Var_Samp_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Session_Source_Variance_Fields = {
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_session_source" */
export type Transact_Session_Source_Variance_Order_By = {
  attempt_count?: InputMaybe<Order_By>;
};

/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_Actual = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin: Scalars['String']['output'];
  actual_height?: Maybe<Scalars['numeric']['output']>;
  actual_length?: Maybe<Scalars['numeric']['output']>;
  actual_plat_no?: Maybe<Scalars['String']['output']>;
  actual_total_axle?: Maybe<Scalars['Int']['output']>;
  actual_weight?: Maybe<Scalars['numeric']['output']>;
  actual_width?: Maybe<Scalars['numeric']['output']>;
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  axle_id?: Maybe<Scalars['uuid']['output']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  location_address?: Maybe<Scalars['String']['output']>;
  location_lat?: Maybe<Scalars['numeric']['output']>;
  location_lng?: Maybe<Scalars['numeric']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources: Array<Scalars['String']['output']>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id: Scalars['uuid']['output'];
  /** An array relationship */
  transactVehicleRevisionsByVehicleActualIdSiteId: Array<Transact_Vehicle_Revision>;
  /** An aggregate relationship */
  transactVehicleRevisionsByVehicleActualIdSiteId_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** An object relationship */
  transactWimSessionBySiteIdSessionId?: Maybe<Transact_Wim_Session>;
  /** An object relationship */
  transact_anpr_capture?: Maybe<Transact_Anpr_Capture>;
  /** An object relationship */
  transact_axle_capture?: Maybe<Transact_Axle_Capture>;
  /** An object relationship */
  transact_cctv?: Maybe<Transact_Cctv>;
  transact_cctv_id?: Maybe<Scalars['uuid']['output']>;
  /** An object relationship */
  transact_dimension?: Maybe<Transact_Dimension>;
  transact_dimension_id?: Maybe<Scalars['uuid']['output']>;
  /** An array relationship */
  transact_vehicle_revisions: Array<Transact_Vehicle_Revision>;
  /** An aggregate relationship */
  transact_vehicle_revisions_aggregate: Transact_Vehicle_Revision_Aggregate;
  /** An array relationship */
  transact_vehicle_statuses: Array<Transact_Vehicle_Status>;
  /** An aggregate relationship */
  transact_vehicle_statuses_aggregate: Transact_Vehicle_Status_Aggregate;
  /** An object relationship */
  transact_weighing?: Maybe<Transact_Weighing>;
  transact_weighing_id?: Maybe<Scalars['uuid']['output']>;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  verification_notes?: Maybe<Scalars['String']['output']>;
  verification_status: Scalars['String']['output'];
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
  verified_by?: Maybe<Scalars['uuid']['output']>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransactVehicleRevisionsByVehicleActualIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransactVehicleRevisionsByVehicleActualIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransact_Vehicle_RevisionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransact_Vehicle_Revisions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Revision_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransact_Vehicle_StatusesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};


/** columns and relationships of "transact_vehicle_actual" */
export type Transact_Vehicle_ActualTransact_Vehicle_Statuses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Status_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};

/** aggregated selection of "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Aggregate = {
  aggregate?: Maybe<Transact_Vehicle_Actual_Aggregate_Fields>;
  nodes: Array<Transact_Vehicle_Actual>;
};

export type Transact_Vehicle_Actual_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp_Count>;
};

export type Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Vehicle_Actual_Select_Column_Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Vehicle_Actual_Select_Column_Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Vehicle_Actual_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Aggregate_Fields = {
  avg?: Maybe<Transact_Vehicle_Actual_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Vehicle_Actual_Max_Fields>;
  min?: Maybe<Transact_Vehicle_Actual_Min_Fields>;
  stddev?: Maybe<Transact_Vehicle_Actual_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Vehicle_Actual_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Vehicle_Actual_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Vehicle_Actual_Sum_Fields>;
  var_pop?: Maybe<Transact_Vehicle_Actual_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Vehicle_Actual_Var_Samp_Fields>;
  variance?: Maybe<Transact_Vehicle_Actual_Variance_Fields>;
};


/** aggregate fields of "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Vehicle_Actual_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Vehicle_Actual_Max_Order_By>;
  min?: InputMaybe<Transact_Vehicle_Actual_Min_Order_By>;
  stddev?: InputMaybe<Transact_Vehicle_Actual_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Vehicle_Actual_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Vehicle_Actual_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Vehicle_Actual_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Vehicle_Actual_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Vehicle_Actual_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Vehicle_Actual_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Arr_Rel_Insert_Input = {
  data: Array<Transact_Vehicle_Actual_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Vehicle_Actual_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Vehicle_Actual_Avg_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Avg_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_vehicle_actual". All fields are combined with a logical 'AND'. */
export type Transact_Vehicle_Actual_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Vehicle_Actual_Bool_Exp>>;
  _not?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Vehicle_Actual_Bool_Exp>>;
  actual_data_origin?: InputMaybe<String_Comparison_Exp>;
  actual_height?: InputMaybe<Numeric_Comparison_Exp>;
  actual_length?: InputMaybe<Numeric_Comparison_Exp>;
  actual_plat_no?: InputMaybe<String_Comparison_Exp>;
  actual_total_axle?: InputMaybe<Int_Comparison_Exp>;
  actual_weight?: InputMaybe<Numeric_Comparison_Exp>;
  actual_width?: InputMaybe<Numeric_Comparison_Exp>;
  anpr_id?: InputMaybe<Uuid_Comparison_Exp>;
  axle_id?: InputMaybe<Uuid_Comparison_Exp>;
  completeness_status?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  location_address?: InputMaybe<String_Comparison_Exp>;
  location_lat?: InputMaybe<Numeric_Comparison_Exp>;
  location_lng?: InputMaybe<Numeric_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  missing_sources?: InputMaybe<String_Array_Comparison_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactVehicleRevisionsByVehicleActualIdSiteId?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  transactVehicleRevisionsByVehicleActualIdSiteId_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Bool_Exp>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  transact_axle_capture?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  transact_cctv?: InputMaybe<Transact_Cctv_Bool_Exp>;
  transact_cctv_id?: InputMaybe<Uuid_Comparison_Exp>;
  transact_dimension?: InputMaybe<Transact_Dimension_Bool_Exp>;
  transact_dimension_id?: InputMaybe<Uuid_Comparison_Exp>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Bool_Exp>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp>;
  transact_weighing?: InputMaybe<Transact_Weighing_Bool_Exp>;
  transact_weighing_id?: InputMaybe<Uuid_Comparison_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  verification_notes?: InputMaybe<String_Comparison_Exp>;
  verification_status?: InputMaybe<String_Comparison_Exp>;
  verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  verified_by?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_vehicle_actual" */
export enum Transact_Vehicle_Actual_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactVehicleActualPkey = 'transact_vehicle_actual_pkey',
  /** unique or primary key constraint on columns "id", "site_id" */
  UqVehicleActualIdSite = 'uq_vehicle_actual_id_site',
  /** unique or primary key constraint on columns "site_id", "session_id" */
  UqVehicleActualSiteSession = 'uq_vehicle_actual_site_session'
}

/** input type for incrementing numeric columns in table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Inc_Input = {
  actual_height?: InputMaybe<Scalars['numeric']['input']>;
  actual_length?: InputMaybe<Scalars['numeric']['input']>;
  actual_total_axle?: InputMaybe<Scalars['Int']['input']>;
  actual_weight?: InputMaybe<Scalars['numeric']['input']>;
  actual_width?: InputMaybe<Scalars['numeric']['input']>;
  location_lat?: InputMaybe<Scalars['numeric']['input']>;
  location_lng?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Insert_Input = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: InputMaybe<Scalars['String']['input']>;
  actual_height?: InputMaybe<Scalars['numeric']['input']>;
  actual_length?: InputMaybe<Scalars['numeric']['input']>;
  actual_plat_no?: InputMaybe<Scalars['String']['input']>;
  actual_total_axle?: InputMaybe<Scalars['Int']['input']>;
  actual_weight?: InputMaybe<Scalars['numeric']['input']>;
  actual_width?: InputMaybe<Scalars['numeric']['input']>;
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  axle_id?: InputMaybe<Scalars['uuid']['input']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_address?: InputMaybe<Scalars['String']['input']>;
  location_lat?: InputMaybe<Scalars['numeric']['input']>;
  location_lng?: InputMaybe<Scalars['numeric']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: InputMaybe<Array<Scalars['String']['input']>>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transactVehicleRevisionsByVehicleActualIdSiteId?: InputMaybe<Transact_Vehicle_Revision_Arr_Rel_Insert_Input>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Obj_Rel_Insert_Input>;
  transact_axle_capture?: InputMaybe<Transact_Axle_Capture_Obj_Rel_Insert_Input>;
  transact_cctv?: InputMaybe<Transact_Cctv_Obj_Rel_Insert_Input>;
  transact_cctv_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_dimension?: InputMaybe<Transact_Dimension_Obj_Rel_Insert_Input>;
  transact_dimension_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_vehicle_revisions?: InputMaybe<Transact_Vehicle_Revision_Arr_Rel_Insert_Input>;
  transact_vehicle_statuses?: InputMaybe<Transact_Vehicle_Status_Arr_Rel_Insert_Input>;
  transact_weighing?: InputMaybe<Transact_Weighing_Obj_Rel_Insert_Input>;
  transact_weighing_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  verification_notes?: InputMaybe<Scalars['String']['input']>;
  verification_status?: InputMaybe<Scalars['String']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified_by?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Transact_Vehicle_Actual_Max_Fields = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: Maybe<Scalars['String']['output']>;
  actual_height?: Maybe<Scalars['numeric']['output']>;
  actual_length?: Maybe<Scalars['numeric']['output']>;
  actual_plat_no?: Maybe<Scalars['String']['output']>;
  actual_total_axle?: Maybe<Scalars['Int']['output']>;
  actual_weight?: Maybe<Scalars['numeric']['output']>;
  actual_width?: Maybe<Scalars['numeric']['output']>;
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  axle_id?: Maybe<Scalars['uuid']['output']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  location_address?: Maybe<Scalars['String']['output']>;
  location_lat?: Maybe<Scalars['numeric']['output']>;
  location_lng?: Maybe<Scalars['numeric']['output']>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: Maybe<Array<Scalars['String']['output']>>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  transact_cctv_id?: Maybe<Scalars['uuid']['output']>;
  transact_dimension_id?: Maybe<Scalars['uuid']['output']>;
  transact_weighing_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  verification_notes?: Maybe<Scalars['String']['output']>;
  verification_status?: Maybe<Scalars['String']['output']>;
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
  verified_by?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Max_Order_By = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: InputMaybe<Order_By>;
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_plat_no?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  anpr_id?: InputMaybe<Order_By>;
  axle_id?: InputMaybe<Order_By>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  location_address?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: InputMaybe<Order_By>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transact_cctv_id?: InputMaybe<Order_By>;
  transact_dimension_id?: InputMaybe<Order_By>;
  transact_weighing_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  verification_notes?: InputMaybe<Order_By>;
  verification_status?: InputMaybe<Order_By>;
  verified_at?: InputMaybe<Order_By>;
  verified_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Vehicle_Actual_Min_Fields = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: Maybe<Scalars['String']['output']>;
  actual_height?: Maybe<Scalars['numeric']['output']>;
  actual_length?: Maybe<Scalars['numeric']['output']>;
  actual_plat_no?: Maybe<Scalars['String']['output']>;
  actual_total_axle?: Maybe<Scalars['Int']['output']>;
  actual_weight?: Maybe<Scalars['numeric']['output']>;
  actual_width?: Maybe<Scalars['numeric']['output']>;
  anpr_id?: Maybe<Scalars['uuid']['output']>;
  axle_id?: Maybe<Scalars['uuid']['output']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  location_address?: Maybe<Scalars['String']['output']>;
  location_lat?: Maybe<Scalars['numeric']['output']>;
  location_lng?: Maybe<Scalars['numeric']['output']>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: Maybe<Array<Scalars['String']['output']>>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  transact_cctv_id?: Maybe<Scalars['uuid']['output']>;
  transact_dimension_id?: Maybe<Scalars['uuid']['output']>;
  transact_weighing_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  verification_notes?: Maybe<Scalars['String']['output']>;
  verification_status?: Maybe<Scalars['String']['output']>;
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
  verified_by?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Min_Order_By = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: InputMaybe<Order_By>;
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_plat_no?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  anpr_id?: InputMaybe<Order_By>;
  axle_id?: InputMaybe<Order_By>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  location_address?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: InputMaybe<Order_By>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transact_cctv_id?: InputMaybe<Order_By>;
  transact_dimension_id?: InputMaybe<Order_By>;
  transact_weighing_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  verification_notes?: InputMaybe<Order_By>;
  verification_status?: InputMaybe<Order_By>;
  verified_at?: InputMaybe<Order_By>;
  verified_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Vehicle_Actual>;
};

/** input type for inserting object relation for remote table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Obj_Rel_Insert_Input = {
  data: Transact_Vehicle_Actual_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Vehicle_Actual_On_Conflict>;
};

/** on_conflict condition type for table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_On_Conflict = {
  constraint: Transact_Vehicle_Actual_Constraint;
  update_columns?: Array<Transact_Vehicle_Actual_Update_Column>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_vehicle_actual". */
export type Transact_Vehicle_Actual_Order_By = {
  actual_data_origin?: InputMaybe<Order_By>;
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_plat_no?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  anpr_id?: InputMaybe<Order_By>;
  axle_id?: InputMaybe<Order_By>;
  completeness_status?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  location_address?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  missing_sources?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transactVehicleRevisionsByVehicleActualIdSiteId_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Order_By>;
  transactWimSessionBySiteIdSessionId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_anpr_capture?: InputMaybe<Transact_Anpr_Capture_Order_By>;
  transact_axle_capture?: InputMaybe<Transact_Axle_Capture_Order_By>;
  transact_cctv?: InputMaybe<Transact_Cctv_Order_By>;
  transact_cctv_id?: InputMaybe<Order_By>;
  transact_dimension?: InputMaybe<Transact_Dimension_Order_By>;
  transact_dimension_id?: InputMaybe<Order_By>;
  transact_vehicle_revisions_aggregate?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Order_By>;
  transact_vehicle_statuses_aggregate?: InputMaybe<Transact_Vehicle_Status_Aggregate_Order_By>;
  transact_weighing?: InputMaybe<Transact_Weighing_Order_By>;
  transact_weighing_id?: InputMaybe<Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  verification_notes?: InputMaybe<Order_By>;
  verification_status?: InputMaybe<Order_By>;
  verified_at?: InputMaybe<Order_By>;
  verified_by?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_vehicle_actual */
export type Transact_Vehicle_Actual_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_vehicle_actual" */
export enum Transact_Vehicle_Actual_Select_Column {
  /** column name */
  ActualDataOrigin = 'actual_data_origin',
  /** column name */
  ActualHeight = 'actual_height',
  /** column name */
  ActualLength = 'actual_length',
  /** column name */
  ActualPlatNo = 'actual_plat_no',
  /** column name */
  ActualTotalAxle = 'actual_total_axle',
  /** column name */
  ActualWeight = 'actual_weight',
  /** column name */
  ActualWidth = 'actual_width',
  /** column name */
  AnprId = 'anpr_id',
  /** column name */
  AxleId = 'axle_id',
  /** column name */
  CompletenessStatus = 'completeness_status',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LocationAddress = 'location_address',
  /** column name */
  LocationLat = 'location_lat',
  /** column name */
  LocationLng = 'location_lng',
  /** column name */
  MissingSources = 'missing_sources',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TransactCctvId = 'transact_cctv_id',
  /** column name */
  TransactDimensionId = 'transact_dimension_id',
  /** column name */
  TransactWeighingId = 'transact_weighing_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  VerificationNotes = 'verification_notes',
  /** column name */
  VerificationStatus = 'verification_status',
  /** column name */
  VerifiedAt = 'verified_at',
  /** column name */
  VerifiedBy = 'verified_by'
}

/** select "transact_vehicle_actual_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_vehicle_actual" */
export enum Transact_Vehicle_Actual_Select_Column_Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_vehicle_actual_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_vehicle_actual" */
export enum Transact_Vehicle_Actual_Select_Column_Transact_Vehicle_Actual_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Set_Input = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: InputMaybe<Scalars['String']['input']>;
  actual_height?: InputMaybe<Scalars['numeric']['input']>;
  actual_length?: InputMaybe<Scalars['numeric']['input']>;
  actual_plat_no?: InputMaybe<Scalars['String']['input']>;
  actual_total_axle?: InputMaybe<Scalars['Int']['input']>;
  actual_weight?: InputMaybe<Scalars['numeric']['input']>;
  actual_width?: InputMaybe<Scalars['numeric']['input']>;
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  axle_id?: InputMaybe<Scalars['uuid']['input']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_address?: InputMaybe<Scalars['String']['input']>;
  location_lat?: InputMaybe<Scalars['numeric']['input']>;
  location_lng?: InputMaybe<Scalars['numeric']['input']>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: InputMaybe<Array<Scalars['String']['input']>>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_cctv_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_dimension_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_weighing_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  verification_notes?: InputMaybe<Scalars['String']['input']>;
  verification_status?: InputMaybe<Scalars['String']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified_by?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Vehicle_Actual_Stddev_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Stddev_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Vehicle_Actual_Stddev_Pop_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Stddev_Pop_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Vehicle_Actual_Stddev_Samp_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Stddev_Samp_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Vehicle_Actual_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Vehicle_Actual_Stream_Cursor_Value_Input = {
  /** REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values. */
  actual_data_origin?: InputMaybe<Scalars['String']['input']>;
  actual_height?: InputMaybe<Scalars['numeric']['input']>;
  actual_length?: InputMaybe<Scalars['numeric']['input']>;
  actual_plat_no?: InputMaybe<Scalars['String']['input']>;
  actual_total_axle?: InputMaybe<Scalars['Int']['input']>;
  actual_weight?: InputMaybe<Scalars['numeric']['input']>;
  actual_width?: InputMaybe<Scalars['numeric']['input']>;
  anpr_id?: InputMaybe<Scalars['uuid']['input']>;
  axle_id?: InputMaybe<Scalars['uuid']['input']>;
  /** EMPTY, PARTIAL, or COMPLETE based on received device source records. */
  completeness_status?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  location_address?: InputMaybe<Scalars['String']['input']>;
  location_lat?: InputMaybe<Scalars['numeric']['input']>;
  location_lng?: InputMaybe<Scalars['numeric']['input']>;
  /** Source types not received when vehicle_actual was finalized; fields remain editable during verification. */
  missing_sources?: InputMaybe<Array<Scalars['String']['input']>>;
  /** WIM session ID for grouping partial source data during verification */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_cctv_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_dimension_id?: InputMaybe<Scalars['uuid']['input']>;
  transact_weighing_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  verification_notes?: InputMaybe<Scalars['String']['input']>;
  verification_status?: InputMaybe<Scalars['String']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified_by?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Transact_Vehicle_Actual_Sum_Fields = {
  actual_height?: Maybe<Scalars['numeric']['output']>;
  actual_length?: Maybe<Scalars['numeric']['output']>;
  actual_total_axle?: Maybe<Scalars['Int']['output']>;
  actual_weight?: Maybe<Scalars['numeric']['output']>;
  actual_width?: Maybe<Scalars['numeric']['output']>;
  location_lat?: Maybe<Scalars['numeric']['output']>;
  location_lng?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Sum_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** update columns of table "transact_vehicle_actual" */
export enum Transact_Vehicle_Actual_Update_Column {
  /** column name */
  ActualDataOrigin = 'actual_data_origin',
  /** column name */
  ActualHeight = 'actual_height',
  /** column name */
  ActualLength = 'actual_length',
  /** column name */
  ActualPlatNo = 'actual_plat_no',
  /** column name */
  ActualTotalAxle = 'actual_total_axle',
  /** column name */
  ActualWeight = 'actual_weight',
  /** column name */
  ActualWidth = 'actual_width',
  /** column name */
  AnprId = 'anpr_id',
  /** column name */
  AxleId = 'axle_id',
  /** column name */
  CompletenessStatus = 'completeness_status',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LocationAddress = 'location_address',
  /** column name */
  LocationLat = 'location_lat',
  /** column name */
  LocationLng = 'location_lng',
  /** column name */
  MissingSources = 'missing_sources',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TransactCctvId = 'transact_cctv_id',
  /** column name */
  TransactDimensionId = 'transact_dimension_id',
  /** column name */
  TransactWeighingId = 'transact_weighing_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  VerificationNotes = 'verification_notes',
  /** column name */
  VerificationStatus = 'verification_status',
  /** column name */
  VerifiedAt = 'verified_at',
  /** column name */
  VerifiedBy = 'verified_by'
}

export type Transact_Vehicle_Actual_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Vehicle_Actual_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Vehicle_Actual_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Vehicle_Actual_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Vehicle_Actual_Var_Pop_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Var_Pop_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Vehicle_Actual_Var_Samp_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Var_Samp_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Vehicle_Actual_Variance_Fields = {
  actual_height?: Maybe<Scalars['Float']['output']>;
  actual_length?: Maybe<Scalars['Float']['output']>;
  actual_total_axle?: Maybe<Scalars['Float']['output']>;
  actual_weight?: Maybe<Scalars['Float']['output']>;
  actual_width?: Maybe<Scalars['Float']['output']>;
  location_lat?: Maybe<Scalars['Float']['output']>;
  location_lng?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_vehicle_actual" */
export type Transact_Vehicle_Actual_Variance_Order_By = {
  actual_height?: InputMaybe<Order_By>;
  actual_length?: InputMaybe<Order_By>;
  actual_total_axle?: InputMaybe<Order_By>;
  actual_weight?: InputMaybe<Order_By>;
  actual_width?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lng?: InputMaybe<Order_By>;
};

/** Immutable before/after audit snapshots for user corrections during verification. */
export type Transact_Vehicle_Revision = {
  after_data: Scalars['jsonb']['output'];
  before_data: Scalars['jsonb']['output'];
  changed_at: Scalars['timestamptz']['output'];
  changed_by: Scalars['uuid']['output'];
  changed_fields: Array<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  /** An object relationship */
  master_site: Master_Site;
  /** An object relationship */
  master_user: Master_User;
  reason?: Maybe<Scalars['String']['output']>;
  revision_no: Scalars['Int']['output'];
  site_id: Scalars['uuid']['output'];
  /** An object relationship */
  transactVehicleActualByVehicleActualIdSiteId?: Maybe<Transact_Vehicle_Actual>;
  /** An object relationship */
  transact_vehicle_actual: Transact_Vehicle_Actual;
  vehicle_actual_id: Scalars['uuid']['output'];
};


/** Immutable before/after audit snapshots for user corrections during verification. */
export type Transact_Vehicle_RevisionAfter_DataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Immutable before/after audit snapshots for user corrections during verification. */
export type Transact_Vehicle_RevisionBefore_DataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Aggregate = {
  aggregate?: Maybe<Transact_Vehicle_Revision_Aggregate_Fields>;
  nodes: Array<Transact_Vehicle_Revision>;
};

export type Transact_Vehicle_Revision_Aggregate_Bool_Exp = {
  count?: InputMaybe<Transact_Vehicle_Revision_Aggregate_Bool_Exp_Count>;
};

export type Transact_Vehicle_Revision_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Aggregate_Fields = {
  avg?: Maybe<Transact_Vehicle_Revision_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Vehicle_Revision_Max_Fields>;
  min?: Maybe<Transact_Vehicle_Revision_Min_Fields>;
  stddev?: Maybe<Transact_Vehicle_Revision_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Vehicle_Revision_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Vehicle_Revision_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Vehicle_Revision_Sum_Fields>;
  var_pop?: Maybe<Transact_Vehicle_Revision_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Vehicle_Revision_Var_Samp_Fields>;
  variance?: Maybe<Transact_Vehicle_Revision_Variance_Fields>;
};


/** aggregate fields of "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Vehicle_Revision_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Vehicle_Revision_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Vehicle_Revision_Max_Order_By>;
  min?: InputMaybe<Transact_Vehicle_Revision_Min_Order_By>;
  stddev?: InputMaybe<Transact_Vehicle_Revision_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Vehicle_Revision_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Vehicle_Revision_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Vehicle_Revision_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Vehicle_Revision_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Vehicle_Revision_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Vehicle_Revision_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Transact_Vehicle_Revision_Append_Input = {
  after_data?: InputMaybe<Scalars['jsonb']['input']>;
  before_data?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Arr_Rel_Insert_Input = {
  data: Array<Transact_Vehicle_Revision_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Vehicle_Revision_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Vehicle_Revision_Avg_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Avg_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_vehicle_revision". All fields are combined with a logical 'AND'. */
export type Transact_Vehicle_Revision_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Vehicle_Revision_Bool_Exp>>;
  _not?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Vehicle_Revision_Bool_Exp>>;
  after_data?: InputMaybe<Jsonb_Comparison_Exp>;
  before_data?: InputMaybe<Jsonb_Comparison_Exp>;
  changed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  changed_by?: InputMaybe<Uuid_Comparison_Exp>;
  changed_fields?: InputMaybe<String_Array_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  revision_no?: InputMaybe<Int_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  transactVehicleActualByVehicleActualIdSiteId?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  vehicle_actual_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_vehicle_revision" */
export enum Transact_Vehicle_Revision_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactVehicleRevisionPkey = 'transact_vehicle_revision_pkey',
  /** unique or primary key constraint on columns "vehicle_actual_id", "revision_no" */
  UqVehicleRevisionNo = 'uq_vehicle_revision_no'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Transact_Vehicle_Revision_Delete_At_Path_Input = {
  after_data?: InputMaybe<Array<Scalars['String']['input']>>;
  before_data?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Transact_Vehicle_Revision_Delete_Elem_Input = {
  after_data?: InputMaybe<Scalars['Int']['input']>;
  before_data?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Transact_Vehicle_Revision_Delete_Key_Input = {
  after_data?: InputMaybe<Scalars['String']['input']>;
  before_data?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Inc_Input = {
  revision_no?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Insert_Input = {
  after_data?: InputMaybe<Scalars['jsonb']['input']>;
  before_data?: InputMaybe<Scalars['jsonb']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  changed_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  reason?: InputMaybe<Scalars['String']['input']>;
  revision_no?: InputMaybe<Scalars['Int']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  transactVehicleActualByVehicleActualIdSiteId?: InputMaybe<Transact_Vehicle_Actual_Obj_Rel_Insert_Input>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Obj_Rel_Insert_Input>;
  vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Transact_Vehicle_Revision_Max_Fields = {
  changed_at?: Maybe<Scalars['timestamptz']['output']>;
  changed_by?: Maybe<Scalars['uuid']['output']>;
  changed_fields?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  revision_no?: Maybe<Scalars['Int']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  vehicle_actual_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Max_Order_By = {
  changed_at?: InputMaybe<Order_By>;
  changed_by?: InputMaybe<Order_By>;
  changed_fields?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  revision_no?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  vehicle_actual_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Vehicle_Revision_Min_Fields = {
  changed_at?: Maybe<Scalars['timestamptz']['output']>;
  changed_by?: Maybe<Scalars['uuid']['output']>;
  changed_fields?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  revision_no?: Maybe<Scalars['Int']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  vehicle_actual_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Min_Order_By = {
  changed_at?: InputMaybe<Order_By>;
  changed_by?: InputMaybe<Order_By>;
  changed_fields?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  revision_no?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  vehicle_actual_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Vehicle_Revision>;
};

/** on_conflict condition type for table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_On_Conflict = {
  constraint: Transact_Vehicle_Revision_Constraint;
  update_columns?: Array<Transact_Vehicle_Revision_Update_Column>;
  where?: InputMaybe<Transact_Vehicle_Revision_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_vehicle_revision". */
export type Transact_Vehicle_Revision_Order_By = {
  after_data?: InputMaybe<Order_By>;
  before_data?: InputMaybe<Order_By>;
  changed_at?: InputMaybe<Order_By>;
  changed_by?: InputMaybe<Order_By>;
  changed_fields?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  reason?: InputMaybe<Order_By>;
  revision_no?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  transactVehicleActualByVehicleActualIdSiteId?: InputMaybe<Transact_Vehicle_Actual_Order_By>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Order_By>;
  vehicle_actual_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_vehicle_revision */
export type Transact_Vehicle_Revision_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Transact_Vehicle_Revision_Prepend_Input = {
  after_data?: InputMaybe<Scalars['jsonb']['input']>;
  before_data?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "transact_vehicle_revision" */
export enum Transact_Vehicle_Revision_Select_Column {
  /** column name */
  AfterData = 'after_data',
  /** column name */
  BeforeData = 'before_data',
  /** column name */
  ChangedAt = 'changed_at',
  /** column name */
  ChangedBy = 'changed_by',
  /** column name */
  ChangedFields = 'changed_fields',
  /** column name */
  Id = 'id',
  /** column name */
  Reason = 'reason',
  /** column name */
  RevisionNo = 'revision_no',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  VehicleActualId = 'vehicle_actual_id'
}

/** input type for updating data in table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Set_Input = {
  after_data?: InputMaybe<Scalars['jsonb']['input']>;
  before_data?: InputMaybe<Scalars['jsonb']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  changed_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  revision_no?: InputMaybe<Scalars['Int']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Vehicle_Revision_Stddev_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Stddev_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Vehicle_Revision_Stddev_Pop_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Stddev_Pop_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Vehicle_Revision_Stddev_Samp_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Stddev_Samp_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Vehicle_Revision_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Vehicle_Revision_Stream_Cursor_Value_Input = {
  after_data?: InputMaybe<Scalars['jsonb']['input']>;
  before_data?: InputMaybe<Scalars['jsonb']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  changed_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  revision_no?: InputMaybe<Scalars['Int']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Transact_Vehicle_Revision_Sum_Fields = {
  revision_no?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Sum_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** update columns of table "transact_vehicle_revision" */
export enum Transact_Vehicle_Revision_Update_Column {
  /** column name */
  AfterData = 'after_data',
  /** column name */
  BeforeData = 'before_data',
  /** column name */
  ChangedAt = 'changed_at',
  /** column name */
  ChangedBy = 'changed_by',
  /** column name */
  ChangedFields = 'changed_fields',
  /** column name */
  Id = 'id',
  /** column name */
  Reason = 'reason',
  /** column name */
  RevisionNo = 'revision_no',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  VehicleActualId = 'vehicle_actual_id'
}

export type Transact_Vehicle_Revision_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Transact_Vehicle_Revision_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Transact_Vehicle_Revision_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Transact_Vehicle_Revision_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Transact_Vehicle_Revision_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Vehicle_Revision_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Transact_Vehicle_Revision_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Vehicle_Revision_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Vehicle_Revision_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Vehicle_Revision_Var_Pop_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Var_Pop_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Vehicle_Revision_Var_Samp_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Var_Samp_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Vehicle_Revision_Variance_Fields = {
  revision_no?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_vehicle_revision" */
export type Transact_Vehicle_Revision_Variance_Order_By = {
  revision_no?: InputMaybe<Order_By>;
};

/** columns and relationships of "transact_vehicle_status" */
export type Transact_Vehicle_Status = {
  attachment?: Maybe<Array<Scalars['String']['output']>>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  masterUserByUpdatedBy?: Maybe<Master_User>;
  /** An object relationship */
  master_site: Master_Site;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  notes?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  site_id: Scalars['uuid']['output'];
  status: Scalars['String']['output'];
  /** An object relationship */
  transact_vehicle_actual: Transact_Vehicle_Actual;
  transact_vehicle_actual_id: Scalars['uuid']['output'];
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregated selection of "transact_vehicle_status" */
export type Transact_Vehicle_Status_Aggregate = {
  aggregate?: Maybe<Transact_Vehicle_Status_Aggregate_Fields>;
  nodes: Array<Transact_Vehicle_Status>;
};

export type Transact_Vehicle_Status_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Vehicle_Status_Aggregate_Bool_Exp_Count>;
};

export type Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Vehicle_Status_Select_Column_Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Vehicle_Status_Select_Column_Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Vehicle_Status_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_vehicle_status" */
export type Transact_Vehicle_Status_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Vehicle_Status_Max_Fields>;
  min?: Maybe<Transact_Vehicle_Status_Min_Fields>;
};


/** aggregate fields of "transact_vehicle_status" */
export type Transact_Vehicle_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Vehicle_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Vehicle_Status_Max_Order_By>;
  min?: InputMaybe<Transact_Vehicle_Status_Min_Order_By>;
};

/** input type for inserting array relation for remote table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Arr_Rel_Insert_Input = {
  data: Array<Transact_Vehicle_Status_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Vehicle_Status_On_Conflict>;
};

/** Boolean expression to filter rows from the table "transact_vehicle_status". All fields are combined with a logical 'AND'. */
export type Transact_Vehicle_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Vehicle_Status_Bool_Exp>>;
  _not?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Vehicle_Status_Bool_Exp>>;
  attachment?: InputMaybe<String_Array_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Bool_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  result?: InputMaybe<String_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actual_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_vehicle_status" */
export enum Transact_Vehicle_Status_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactVehicleStatusPkey = 'transact_vehicle_status_pkey',
  /** unique or primary key constraint on columns "transact_vehicle_actual_id" */
  UqVehicleStatusCurrent = 'uq_vehicle_status_current'
}

/** input type for inserting data into table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Insert_Input = {
  attachment?: InputMaybe<Array<Scalars['String']['input']>>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  notes?: InputMaybe<Scalars['String']['input']>;
  result?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Obj_Rel_Insert_Input>;
  transact_vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Vehicle_Status_Max_Fields = {
  attachment?: Maybe<Array<Scalars['String']['output']>>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transact_vehicle_actual_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Max_Order_By = {
  attachment?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  result?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  transact_vehicle_actual_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Vehicle_Status_Min_Fields = {
  attachment?: Maybe<Array<Scalars['String']['output']>>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transact_vehicle_actual_id?: Maybe<Scalars['uuid']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Min_Order_By = {
  attachment?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  result?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  transact_vehicle_actual_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Vehicle_Status>;
};

/** on_conflict condition type for table "transact_vehicle_status" */
export type Transact_Vehicle_Status_On_Conflict = {
  constraint: Transact_Vehicle_Status_Constraint;
  update_columns?: Array<Transact_Vehicle_Status_Update_Column>;
  where?: InputMaybe<Transact_Vehicle_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_vehicle_status". */
export type Transact_Vehicle_Status_Order_By = {
  attachment?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  masterUserByUpdatedBy?: InputMaybe<Master_User_Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  notes?: InputMaybe<Order_By>;
  result?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  transact_vehicle_actual?: InputMaybe<Transact_Vehicle_Actual_Order_By>;
  transact_vehicle_actual_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_vehicle_status */
export type Transact_Vehicle_Status_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_vehicle_status" */
export enum Transact_Vehicle_Status_Select_Column {
  /** column name */
  Attachment = 'attachment',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Notes = 'notes',
  /** column name */
  Result = 'result',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  Status = 'status',
  /** column name */
  TransactVehicleActualId = 'transact_vehicle_actual_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_vehicle_status_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_vehicle_status" */
export enum Transact_Vehicle_Status_Select_Column_Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_vehicle_status_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_vehicle_status" */
export enum Transact_Vehicle_Status_Select_Column_Transact_Vehicle_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Set_Input = {
  attachment?: InputMaybe<Array<Scalars['String']['input']>>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  result?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transact_vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "transact_vehicle_status" */
export type Transact_Vehicle_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Vehicle_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Vehicle_Status_Stream_Cursor_Value_Input = {
  attachment?: InputMaybe<Array<Scalars['String']['input']>>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  result?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transact_vehicle_actual_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "transact_vehicle_status" */
export enum Transact_Vehicle_Status_Update_Column {
  /** column name */
  Attachment = 'attachment',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  Notes = 'notes',
  /** column name */
  Result = 'result',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  Status = 'status',
  /** column name */
  TransactVehicleActualId = 'transact_vehicle_actual_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Vehicle_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Vehicle_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Vehicle_Status_Bool_Exp;
};

/** columns and relationships of "transact_weighing" */
export type Transact_Weighing = {
  axle_detail?: Maybe<Scalars['jsonb']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  master_site: Master_Site;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id: Scalars['uuid']['output'];
  total_axle?: Maybe<Scalars['Int']['output']>;
  total_weight?: Maybe<Scalars['numeric']['output']>;
  /** An object relationship */
  transactWimSessionBySessionIdSiteId?: Maybe<Transact_Wim_Session>;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An object relationship */
  transact_wim_session?: Maybe<Transact_Wim_Session>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "transact_weighing" */
export type Transact_WeighingAxle_DetailArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** columns and relationships of "transact_weighing" */
export type Transact_WeighingTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** columns and relationships of "transact_weighing" */
export type Transact_WeighingTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};

/** aggregated selection of "transact_weighing" */
export type Transact_Weighing_Aggregate = {
  aggregate?: Maybe<Transact_Weighing_Aggregate_Fields>;
  nodes: Array<Transact_Weighing>;
};

export type Transact_Weighing_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp_Count>;
};

export type Transact_Weighing_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Weighing_Select_Column_Transact_Weighing_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Weighing_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Weighing_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Weighing_Select_Column_Transact_Weighing_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Weighing_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Weighing_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Weighing_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_weighing" */
export type Transact_Weighing_Aggregate_Fields = {
  avg?: Maybe<Transact_Weighing_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Weighing_Max_Fields>;
  min?: Maybe<Transact_Weighing_Min_Fields>;
  stddev?: Maybe<Transact_Weighing_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Weighing_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Weighing_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Weighing_Sum_Fields>;
  var_pop?: Maybe<Transact_Weighing_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Weighing_Var_Samp_Fields>;
  variance?: Maybe<Transact_Weighing_Variance_Fields>;
};


/** aggregate fields of "transact_weighing" */
export type Transact_Weighing_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_weighing" */
export type Transact_Weighing_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Weighing_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Weighing_Max_Order_By>;
  min?: InputMaybe<Transact_Weighing_Min_Order_By>;
  stddev?: InputMaybe<Transact_Weighing_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Weighing_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Weighing_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Weighing_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Weighing_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Weighing_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Weighing_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Transact_Weighing_Append_Input = {
  axle_detail?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "transact_weighing" */
export type Transact_Weighing_Arr_Rel_Insert_Input = {
  data: Array<Transact_Weighing_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Weighing_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Weighing_Avg_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_weighing" */
export type Transact_Weighing_Avg_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_weighing". All fields are combined with a logical 'AND'. */
export type Transact_Weighing_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Weighing_Bool_Exp>>;
  _not?: InputMaybe<Transact_Weighing_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Weighing_Bool_Exp>>;
  axle_detail?: InputMaybe<Jsonb_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  total_axle?: InputMaybe<Int_Comparison_Exp>;
  total_weight?: InputMaybe<Numeric_Comparison_Exp>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_weighing" */
export enum Transact_Weighing_Constraint {
  /** unique or primary key constraint on columns "id" */
  TransactWeighingPkey = 'transact_weighing_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Transact_Weighing_Delete_At_Path_Input = {
  axle_detail?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Transact_Weighing_Delete_Elem_Input = {
  axle_detail?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Transact_Weighing_Delete_Key_Input = {
  axle_detail?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "transact_weighing" */
export type Transact_Weighing_Inc_Input = {
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  total_weight?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "transact_weighing" */
export type Transact_Weighing_Insert_Input = {
  axle_detail?: InputMaybe<Scalars['jsonb']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  total_weight?: InputMaybe<Scalars['numeric']['input']>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Obj_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Weighing_Max_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  total_axle?: Maybe<Scalars['Int']['output']>;
  total_weight?: Maybe<Scalars['numeric']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_weighing" */
export type Transact_Weighing_Max_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Weighing_Min_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: Maybe<Scalars['uuid']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  total_axle?: Maybe<Scalars['Int']['output']>;
  total_weight?: Maybe<Scalars['numeric']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_weighing" */
export type Transact_Weighing_Min_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_weighing" */
export type Transact_Weighing_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Weighing>;
};

/** input type for inserting object relation for remote table "transact_weighing" */
export type Transact_Weighing_Obj_Rel_Insert_Input = {
  data: Transact_Weighing_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Weighing_On_Conflict>;
};

/** on_conflict condition type for table "transact_weighing" */
export type Transact_Weighing_On_Conflict = {
  constraint: Transact_Weighing_Constraint;
  update_columns?: Array<Transact_Weighing_Update_Column>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_weighing". */
export type Transact_Weighing_Order_By = {
  axle_detail?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  session_id?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
  transactWimSessionBySessionIdSiteId?: InputMaybe<Transact_Wim_Session_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_wim_session?: InputMaybe<Transact_Wim_Session_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_weighing */
export type Transact_Weighing_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Transact_Weighing_Prepend_Input = {
  axle_detail?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "transact_weighing" */
export enum Transact_Weighing_Select_Column {
  /** column name */
  AxleDetail = 'axle_detail',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TotalAxle = 'total_axle',
  /** column name */
  TotalWeight = 'total_weight',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_weighing_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_weighing" */
export enum Transact_Weighing_Select_Column_Transact_Weighing_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "transact_weighing_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_weighing" */
export enum Transact_Weighing_Select_Column_Transact_Weighing_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "transact_weighing" */
export type Transact_Weighing_Set_Input = {
  axle_detail?: InputMaybe<Scalars['jsonb']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  total_weight?: InputMaybe<Scalars['numeric']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Weighing_Stddev_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_weighing" */
export type Transact_Weighing_Stddev_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Weighing_Stddev_Pop_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_weighing" */
export type Transact_Weighing_Stddev_Pop_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Weighing_Stddev_Samp_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_weighing" */
export type Transact_Weighing_Stddev_Samp_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_weighing" */
export type Transact_Weighing_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Weighing_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Weighing_Stream_Cursor_Value_Input = {
  axle_detail?: InputMaybe<Scalars['jsonb']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** WIM session ID. Placeholder row may contain only id + session_id when weighing is missing */
  session_id?: InputMaybe<Scalars['uuid']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  total_axle?: InputMaybe<Scalars['Int']['input']>;
  total_weight?: InputMaybe<Scalars['numeric']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Transact_Weighing_Sum_Fields = {
  total_axle?: Maybe<Scalars['Int']['output']>;
  total_weight?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "transact_weighing" */
export type Transact_Weighing_Sum_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** update columns of table "transact_weighing" */
export enum Transact_Weighing_Update_Column {
  /** column name */
  AxleDetail = 'axle_detail',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  TotalAxle = 'total_axle',
  /** column name */
  TotalWeight = 'total_weight',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Weighing_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Transact_Weighing_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Transact_Weighing_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Transact_Weighing_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Transact_Weighing_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Weighing_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Transact_Weighing_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Weighing_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Weighing_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Weighing_Var_Pop_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_weighing" */
export type Transact_Weighing_Var_Pop_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Weighing_Var_Samp_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_weighing" */
export type Transact_Weighing_Var_Samp_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Weighing_Variance_Fields = {
  total_axle?: Maybe<Scalars['Float']['output']>;
  total_weight?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_weighing" */
export type Transact_Weighing_Variance_Order_By = {
  total_axle?: InputMaybe<Order_By>;
  total_weight?: InputMaybe<Order_By>;
};

/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_Session = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code: Scalars['String']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when session was ended/completed */
  ended_at?: Maybe<Scalars['timestamptz']['output']>;
  ended_by?: Maybe<Scalars['uuid']['output']>;
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  /** If true, services process this session using dummy data instead of real device/FTP sources */
  is_dummy: Scalars['Boolean']['output'];
  /** An object relationship */
  masterUserByStartedBy?: Maybe<Master_User>;
  /** An object relationship */
  master_site: Master_Site;
  /** An object relationship */
  master_user?: Maybe<Master_User>;
  notes?: Maybe<Scalars['String']['output']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Int']['output']>;
  session_name?: Maybe<Scalars['String']['output']>;
  site_id: Scalars['uuid']['output'];
  /** Timestamp when session was started */
  started_at: Scalars['timestamptz']['output'];
  started_by?: Maybe<Scalars['uuid']['output']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status: Scalars['String']['output'];
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Int']['output']>;
  /** An array relationship */
  transactAnprCapturesBySessionIdSiteId: Array<Transact_Anpr_Capture>;
  /** An aggregate relationship */
  transactAnprCapturesBySessionIdSiteId_aggregate: Transact_Anpr_Capture_Aggregate;
  /** An array relationship */
  transactAxleCapturesBySessionIdSiteId: Array<Transact_Axle_Capture>;
  /** An aggregate relationship */
  transactAxleCapturesBySessionIdSiteId_aggregate: Transact_Axle_Capture_Aggregate;
  /** An array relationship */
  transactCctvsBySessionIdSiteId: Array<Transact_Cctv>;
  /** An aggregate relationship */
  transactCctvsBySessionIdSiteId_aggregate: Transact_Cctv_Aggregate;
  /** An array relationship */
  transactDimensionsBySessionIdSiteId: Array<Transact_Dimension>;
  /** An aggregate relationship */
  transactDimensionsBySessionIdSiteId_aggregate: Transact_Dimension_Aggregate;
  /** An array relationship */
  transactSessionSourcesBySessionIdSiteId: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transactSessionSourcesBySessionIdSiteId_aggregate: Transact_Session_Source_Aggregate;
  /** An array relationship */
  transactVehicleActualsBySessionIdSiteId: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transactVehicleActualsBySessionIdSiteId_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An array relationship */
  transactWeighingsBySessionIdSiteId: Array<Transact_Weighing>;
  /** An aggregate relationship */
  transactWeighingsBySessionIdSiteId_aggregate: Transact_Weighing_Aggregate;
  /** An array relationship */
  transact_anpr_captures: Array<Transact_Anpr_Capture>;
  /** An aggregate relationship */
  transact_anpr_captures_aggregate: Transact_Anpr_Capture_Aggregate;
  /** An array relationship */
  transact_axle_captures: Array<Transact_Axle_Capture>;
  /** An aggregate relationship */
  transact_axle_captures_aggregate: Transact_Axle_Capture_Aggregate;
  /** An array relationship */
  transact_cctvs: Array<Transact_Cctv>;
  /** An aggregate relationship */
  transact_cctvs_aggregate: Transact_Cctv_Aggregate;
  /** An array relationship */
  transact_dimensions: Array<Transact_Dimension>;
  /** An aggregate relationship */
  transact_dimensions_aggregate: Transact_Dimension_Aggregate;
  /** An array relationship */
  transact_session_sources: Array<Transact_Session_Source>;
  /** An aggregate relationship */
  transact_session_sources_aggregate: Transact_Session_Source_Aggregate;
  /** An array relationship */
  transact_vehicle_actuals: Array<Transact_Vehicle_Actual>;
  /** An aggregate relationship */
  transact_vehicle_actuals_aggregate: Transact_Vehicle_Actual_Aggregate;
  /** An array relationship */
  transact_weighings: Array<Transact_Weighing>;
  /** An aggregate relationship */
  transact_weighings_aggregate: Transact_Weighing_Aggregate;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactAnprCapturesBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactAnprCapturesBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactAxleCapturesBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactAxleCapturesBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactCctvsBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactCctvsBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactDimensionsBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactDimensionsBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactSessionSourcesBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactSessionSourcesBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactVehicleActualsBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactVehicleActualsBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactWeighingsBySessionIdSiteIdArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransactWeighingsBySessionIdSiteId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Anpr_CapturesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Anpr_Captures_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Anpr_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Anpr_Capture_Order_By>>;
  where?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Axle_CapturesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Axle_Captures_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Axle_Capture_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Axle_Capture_Order_By>>;
  where?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_CctvsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Cctvs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Cctv_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Cctv_Order_By>>;
  where?: InputMaybe<Transact_Cctv_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_DimensionsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Dimensions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Dimension_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Dimension_Order_By>>;
  where?: InputMaybe<Transact_Dimension_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Session_SourcesArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Session_Sources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Session_Source_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Session_Source_Order_By>>;
  where?: InputMaybe<Transact_Session_Source_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Vehicle_ActualsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Vehicle_Actuals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Vehicle_Actual_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Vehicle_Actual_Order_By>>;
  where?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_WeighingsArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};


/** Transaction table for tracking WIM (Weigh In Motion) process sessions */
export type Transact_Wim_SessionTransact_Weighings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transact_Weighing_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transact_Weighing_Order_By>>;
  where?: InputMaybe<Transact_Weighing_Bool_Exp>;
};

/** aggregated selection of "transact_wim_session" */
export type Transact_Wim_Session_Aggregate = {
  aggregate?: Maybe<Transact_Wim_Session_Aggregate_Fields>;
  nodes: Array<Transact_Wim_Session>;
};

export type Transact_Wim_Session_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Transact_Wim_Session_Aggregate_Bool_Exp_Count>;
};

export type Transact_Wim_Session_Aggregate_Bool_Exp_Bool_And = {
  arguments: Transact_Wim_Session_Select_Column_Transact_Wim_Session_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Wim_Session_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Transact_Wim_Session_Select_Column_Transact_Wim_Session_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Transact_Wim_Session_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "transact_wim_session" */
export type Transact_Wim_Session_Aggregate_Fields = {
  avg?: Maybe<Transact_Wim_Session_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transact_Wim_Session_Max_Fields>;
  min?: Maybe<Transact_Wim_Session_Min_Fields>;
  stddev?: Maybe<Transact_Wim_Session_Stddev_Fields>;
  stddev_pop?: Maybe<Transact_Wim_Session_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transact_Wim_Session_Stddev_Samp_Fields>;
  sum?: Maybe<Transact_Wim_Session_Sum_Fields>;
  var_pop?: Maybe<Transact_Wim_Session_Var_Pop_Fields>;
  var_samp?: Maybe<Transact_Wim_Session_Var_Samp_Fields>;
  variance?: Maybe<Transact_Wim_Session_Variance_Fields>;
};


/** aggregate fields of "transact_wim_session" */
export type Transact_Wim_Session_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transact_Wim_Session_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transact_wim_session" */
export type Transact_Wim_Session_Aggregate_Order_By = {
  avg?: InputMaybe<Transact_Wim_Session_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transact_Wim_Session_Max_Order_By>;
  min?: InputMaybe<Transact_Wim_Session_Min_Order_By>;
  stddev?: InputMaybe<Transact_Wim_Session_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transact_Wim_Session_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transact_Wim_Session_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transact_Wim_Session_Sum_Order_By>;
  var_pop?: InputMaybe<Transact_Wim_Session_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transact_Wim_Session_Var_Samp_Order_By>;
  variance?: InputMaybe<Transact_Wim_Session_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "transact_wim_session" */
export type Transact_Wim_Session_Arr_Rel_Insert_Input = {
  data: Array<Transact_Wim_Session_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Wim_Session_On_Conflict>;
};

/** aggregate avg on columns */
export type Transact_Wim_Session_Avg_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Avg_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transact_wim_session". All fields are combined with a logical 'AND'. */
export type Transact_Wim_Session_Bool_Exp = {
  _and?: InputMaybe<Array<Transact_Wim_Session_Bool_Exp>>;
  _not?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
  _or?: InputMaybe<Array<Transact_Wim_Session_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  ended_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  ended_by?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  is_dummy?: InputMaybe<Boolean_Comparison_Exp>;
  masterUserByStartedBy?: InputMaybe<Master_User_Bool_Exp>;
  master_site?: InputMaybe<Master_Site_Bool_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  processed_vehicles?: InputMaybe<Int_Comparison_Exp>;
  session_name?: InputMaybe<String_Comparison_Exp>;
  site_id?: InputMaybe<Uuid_Comparison_Exp>;
  started_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  started_by?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  total_vehicles?: InputMaybe<Int_Comparison_Exp>;
  transactAnprCapturesBySessionIdSiteId?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  transactAnprCapturesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp>;
  transactAxleCapturesBySessionIdSiteId?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  transactAxleCapturesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp>;
  transactCctvsBySessionIdSiteId?: InputMaybe<Transact_Cctv_Bool_Exp>;
  transactCctvsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp>;
  transactDimensionsBySessionIdSiteId?: InputMaybe<Transact_Dimension_Bool_Exp>;
  transactDimensionsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp>;
  transactSessionSourcesBySessionIdSiteId?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transactSessionSourcesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  transactVehicleActualsBySessionIdSiteId?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transactVehicleActualsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transactWeighingsBySessionIdSiteId?: InputMaybe<Transact_Weighing_Bool_Exp>;
  transactWeighingsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp>;
  transact_anpr_captures?: InputMaybe<Transact_Anpr_Capture_Bool_Exp>;
  transact_anpr_captures_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Bool_Exp>;
  transact_axle_captures?: InputMaybe<Transact_Axle_Capture_Bool_Exp>;
  transact_axle_captures_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Bool_Exp>;
  transact_cctvs?: InputMaybe<Transact_Cctv_Bool_Exp>;
  transact_cctvs_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Bool_Exp>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Bool_Exp>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Bool_Exp>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Bool_Exp>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Bool_Exp>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Bool_Exp>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Bool_Exp>;
  transact_weighings?: InputMaybe<Transact_Weighing_Bool_Exp>;
  transact_weighings_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Bool_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "transact_wim_session" */
export enum Transact_Wim_Session_Constraint {
  /** unique or primary key constraint on columns "code" */
  TransactWimSessionCodeKey = 'transact_wim_session_code_key',
  /** unique or primary key constraint on columns "id" */
  TransactWimSessionPkey = 'transact_wim_session_pkey',
  /** unique or primary key constraint on columns "site_id" */
  UqActiveWimSessionPerSite = 'uq_active_wim_session_per_site',
  /** unique or primary key constraint on columns "id", "site_id" */
  UqWimSessionIdSite = 'uq_wim_session_id_site'
}

/** input type for incrementing numeric columns in table "transact_wim_session" */
export type Transact_Wim_Session_Inc_Input = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Scalars['Int']['input']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "transact_wim_session" */
export type Transact_Wim_Session_Insert_Input = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when session was ended/completed */
  ended_at?: InputMaybe<Scalars['timestamptz']['input']>;
  ended_by?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, services process this session using dummy data instead of real device/FTP sources */
  is_dummy?: InputMaybe<Scalars['Boolean']['input']>;
  masterUserByStartedBy?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  master_site?: InputMaybe<Master_Site_Obj_Rel_Insert_Input>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Scalars['Int']['input']>;
  session_name?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Timestamp when session was started */
  started_at?: InputMaybe<Scalars['timestamptz']['input']>;
  started_by?: InputMaybe<Scalars['uuid']['input']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Scalars['Int']['input']>;
  transactAnprCapturesBySessionIdSiteId?: InputMaybe<Transact_Anpr_Capture_Arr_Rel_Insert_Input>;
  transactAxleCapturesBySessionIdSiteId?: InputMaybe<Transact_Axle_Capture_Arr_Rel_Insert_Input>;
  transactCctvsBySessionIdSiteId?: InputMaybe<Transact_Cctv_Arr_Rel_Insert_Input>;
  transactDimensionsBySessionIdSiteId?: InputMaybe<Transact_Dimension_Arr_Rel_Insert_Input>;
  transactSessionSourcesBySessionIdSiteId?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  transactVehicleActualsBySessionIdSiteId?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transactWeighingsBySessionIdSiteId?: InputMaybe<Transact_Weighing_Arr_Rel_Insert_Input>;
  transact_anpr_captures?: InputMaybe<Transact_Anpr_Capture_Arr_Rel_Insert_Input>;
  transact_axle_captures?: InputMaybe<Transact_Axle_Capture_Arr_Rel_Insert_Input>;
  transact_cctvs?: InputMaybe<Transact_Cctv_Arr_Rel_Insert_Input>;
  transact_dimensions?: InputMaybe<Transact_Dimension_Arr_Rel_Insert_Input>;
  transact_session_sources?: InputMaybe<Transact_Session_Source_Arr_Rel_Insert_Input>;
  transact_vehicle_actuals?: InputMaybe<Transact_Vehicle_Actual_Arr_Rel_Insert_Input>;
  transact_weighings?: InputMaybe<Transact_Weighing_Arr_Rel_Insert_Input>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Transact_Wim_Session_Max_Fields = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when session was ended/completed */
  ended_at?: Maybe<Scalars['timestamptz']['output']>;
  ended_by?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Int']['output']>;
  session_name?: Maybe<Scalars['String']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  /** Timestamp when session was started */
  started_at?: Maybe<Scalars['timestamptz']['output']>;
  started_by?: Maybe<Scalars['uuid']['output']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: Maybe<Scalars['String']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Max_Order_By = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  /** Timestamp when session was ended/completed */
  ended_at?: InputMaybe<Order_By>;
  ended_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  session_name?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  /** Timestamp when session was started */
  started_at?: InputMaybe<Order_By>;
  started_by?: InputMaybe<Order_By>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transact_Wim_Session_Min_Fields = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when session was ended/completed */
  ended_at?: Maybe<Scalars['timestamptz']['output']>;
  ended_by?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Int']['output']>;
  session_name?: Maybe<Scalars['String']['output']>;
  site_id?: Maybe<Scalars['uuid']['output']>;
  /** Timestamp when session was started */
  started_at?: Maybe<Scalars['timestamptz']['output']>;
  started_by?: Maybe<Scalars['uuid']['output']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: Maybe<Scalars['String']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Int']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Min_Order_By = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  /** Timestamp when session was ended/completed */
  ended_at?: InputMaybe<Order_By>;
  ended_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  session_name?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  /** Timestamp when session was started */
  started_at?: InputMaybe<Order_By>;
  started_by?: InputMaybe<Order_By>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transact_wim_session" */
export type Transact_Wim_Session_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transact_Wim_Session>;
};

/** input type for inserting object relation for remote table "transact_wim_session" */
export type Transact_Wim_Session_Obj_Rel_Insert_Input = {
  data: Transact_Wim_Session_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Transact_Wim_Session_On_Conflict>;
};

/** on_conflict condition type for table "transact_wim_session" */
export type Transact_Wim_Session_On_Conflict = {
  constraint: Transact_Wim_Session_Constraint;
  update_columns?: Array<Transact_Wim_Session_Update_Column>;
  where?: InputMaybe<Transact_Wim_Session_Bool_Exp>;
};

/** Ordering options when selecting data from "transact_wim_session". */
export type Transact_Wim_Session_Order_By = {
  code?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  ended_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  is_dummy?: InputMaybe<Order_By>;
  masterUserByStartedBy?: InputMaybe<Master_User_Order_By>;
  master_site?: InputMaybe<Master_Site_Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  notes?: InputMaybe<Order_By>;
  processed_vehicles?: InputMaybe<Order_By>;
  session_name?: InputMaybe<Order_By>;
  site_id?: InputMaybe<Order_By>;
  started_at?: InputMaybe<Order_By>;
  started_by?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  total_vehicles?: InputMaybe<Order_By>;
  transactAnprCapturesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Order_By>;
  transactAxleCapturesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Order_By>;
  transactCctvsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Order_By>;
  transactDimensionsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Order_By>;
  transactSessionSourcesBySessionIdSiteId_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  transactVehicleActualsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transactWeighingsBySessionIdSiteId_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Order_By>;
  transact_anpr_captures_aggregate?: InputMaybe<Transact_Anpr_Capture_Aggregate_Order_By>;
  transact_axle_captures_aggregate?: InputMaybe<Transact_Axle_Capture_Aggregate_Order_By>;
  transact_cctvs_aggregate?: InputMaybe<Transact_Cctv_Aggregate_Order_By>;
  transact_dimensions_aggregate?: InputMaybe<Transact_Dimension_Aggregate_Order_By>;
  transact_session_sources_aggregate?: InputMaybe<Transact_Session_Source_Aggregate_Order_By>;
  transact_vehicle_actuals_aggregate?: InputMaybe<Transact_Vehicle_Actual_Aggregate_Order_By>;
  transact_weighings_aggregate?: InputMaybe<Transact_Weighing_Aggregate_Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transact_wim_session */
export type Transact_Wim_Session_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "transact_wim_session" */
export enum Transact_Wim_Session_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  EndedAt = 'ended_at',
  /** column name */
  EndedBy = 'ended_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsDummy = 'is_dummy',
  /** column name */
  Notes = 'notes',
  /** column name */
  ProcessedVehicles = 'processed_vehicles',
  /** column name */
  SessionName = 'session_name',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  StartedAt = 'started_at',
  /** column name */
  StartedBy = 'started_by',
  /** column name */
  Status = 'status',
  /** column name */
  TotalVehicles = 'total_vehicles',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

/** select "transact_wim_session_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transact_wim_session" */
export enum Transact_Wim_Session_Select_Column_Transact_Wim_Session_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsDummy = 'is_dummy'
}

/** select "transact_wim_session_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transact_wim_session" */
export enum Transact_Wim_Session_Select_Column_Transact_Wim_Session_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsDummy = 'is_dummy'
}

/** input type for updating data in table "transact_wim_session" */
export type Transact_Wim_Session_Set_Input = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when session was ended/completed */
  ended_at?: InputMaybe<Scalars['timestamptz']['input']>;
  ended_by?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, services process this session using dummy data instead of real device/FTP sources */
  is_dummy?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Scalars['Int']['input']>;
  session_name?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Timestamp when session was started */
  started_at?: InputMaybe<Scalars['timestamptz']['input']>;
  started_by?: InputMaybe<Scalars['uuid']['input']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Transact_Wim_Session_Stddev_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Stddev_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transact_Wim_Session_Stddev_Pop_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Stddev_Pop_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transact_Wim_Session_Stddev_Samp_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Stddev_Samp_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transact_wim_session" */
export type Transact_Wim_Session_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transact_Wim_Session_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transact_Wim_Session_Stream_Cursor_Value_Input = {
  /** Unique session code identifier (e.g., WIM-2025-0001) */
  code?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when session was ended/completed */
  ended_at?: InputMaybe<Scalars['timestamptz']['input']>;
  ended_by?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, services process this session using dummy data instead of real device/FTP sources */
  is_dummy?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Scalars['Int']['input']>;
  session_name?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['uuid']['input']>;
  /** Timestamp when session was started */
  started_at?: InputMaybe<Scalars['timestamptz']['input']>;
  started_by?: InputMaybe<Scalars['uuid']['input']>;
  /** Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Scalars['Int']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Transact_Wim_Session_Sum_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Int']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Sum_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** update columns of table "transact_wim_session" */
export enum Transact_Wim_Session_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  EndedAt = 'ended_at',
  /** column name */
  EndedBy = 'ended_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  IsDummy = 'is_dummy',
  /** column name */
  Notes = 'notes',
  /** column name */
  ProcessedVehicles = 'processed_vehicles',
  /** column name */
  SessionName = 'session_name',
  /** column name */
  SiteId = 'site_id',
  /** column name */
  StartedAt = 'started_at',
  /** column name */
  StartedBy = 'started_by',
  /** column name */
  Status = 'status',
  /** column name */
  TotalVehicles = 'total_vehicles',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date'
}

export type Transact_Wim_Session_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transact_Wim_Session_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transact_Wim_Session_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transact_Wim_Session_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transact_Wim_Session_Var_Pop_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Var_Pop_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transact_Wim_Session_Var_Samp_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Var_Samp_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transact_Wim_Session_Variance_Fields = {
  /** Number of vehicles processed so far */
  processed_vehicles?: Maybe<Scalars['Float']['output']>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transact_wim_session" */
export type Transact_Wim_Session_Variance_Order_By = {
  /** Number of vehicles processed so far */
  processed_vehicles?: InputMaybe<Order_By>;
  /** Total number of vehicles expected in this session */
  total_vehicles?: InputMaybe<Order_By>;
};

/** columns and relationships of "user_login_history" */
export type User_Login_History = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  device_info?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  ip_address?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  login_time?: Maybe<Scalars['timestamptz']['output']>;
  logout_time?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  master_user: Master_User;
  token_id?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "user_login_history" */
export type User_Login_History_Aggregate = {
  aggregate?: Maybe<User_Login_History_Aggregate_Fields>;
  nodes: Array<User_Login_History>;
};

export type User_Login_History_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<User_Login_History_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<User_Login_History_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<User_Login_History_Aggregate_Bool_Exp_Count>;
};

export type User_Login_History_Aggregate_Bool_Exp_Bool_And = {
  arguments: User_Login_History_Select_Column_User_Login_History_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Login_History_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Login_History_Aggregate_Bool_Exp_Bool_Or = {
  arguments: User_Login_History_Select_Column_User_Login_History_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Login_History_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Login_History_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Login_History_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Login_History_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_login_history" */
export type User_Login_History_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<User_Login_History_Max_Fields>;
  min?: Maybe<User_Login_History_Min_Fields>;
};


/** aggregate fields of "user_login_history" */
export type User_Login_History_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Login_History_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_login_history" */
export type User_Login_History_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Login_History_Max_Order_By>;
  min?: InputMaybe<User_Login_History_Min_Order_By>;
};

/** input type for inserting array relation for remote table "user_login_history" */
export type User_Login_History_Arr_Rel_Insert_Input = {
  data: Array<User_Login_History_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Login_History_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user_login_history". All fields are combined with a logical 'AND'. */
export type User_Login_History_Bool_Exp = {
  _and?: InputMaybe<Array<User_Login_History_Bool_Exp>>;
  _not?: InputMaybe<User_Login_History_Bool_Exp>;
  _or?: InputMaybe<Array<User_Login_History_Bool_Exp>>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  created_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  device_info?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  ip_address?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_deleted?: InputMaybe<Boolean_Comparison_Exp>;
  login_time?: InputMaybe<Timestamptz_Comparison_Exp>;
  logout_time?: InputMaybe<Timestamptz_Comparison_Exp>;
  master_user?: InputMaybe<Master_User_Bool_Exp>;
  token_id?: InputMaybe<String_Comparison_Exp>;
  updated_by?: InputMaybe<Uuid_Comparison_Exp>;
  updated_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_login_history" */
export enum User_Login_History_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserLoginHistoryPkey = 'user_login_history_pkey'
}

/** input type for inserting data into table "user_login_history" */
export type User_Login_History_Insert_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  login_time?: InputMaybe<Scalars['timestamptz']['input']>;
  logout_time?: InputMaybe<Scalars['timestamptz']['input']>;
  master_user?: InputMaybe<Master_User_Obj_Rel_Insert_Input>;
  token_id?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type User_Login_History_Max_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  device_info?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  login_time?: Maybe<Scalars['timestamptz']['output']>;
  logout_time?: Maybe<Scalars['timestamptz']['output']>;
  token_id?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "user_login_history" */
export type User_Login_History_Max_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_info?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  login_time?: InputMaybe<Order_By>;
  logout_time?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Login_History_Min_Fields = {
  created_by?: Maybe<Scalars['uuid']['output']>;
  created_date?: Maybe<Scalars['timestamptz']['output']>;
  device_info?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  login_time?: Maybe<Scalars['timestamptz']['output']>;
  logout_time?: Maybe<Scalars['timestamptz']['output']>;
  token_id?: Maybe<Scalars['String']['output']>;
  updated_by?: Maybe<Scalars['uuid']['output']>;
  updated_date?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "user_login_history" */
export type User_Login_History_Min_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_info?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  login_time?: InputMaybe<Order_By>;
  logout_time?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_login_history" */
export type User_Login_History_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Login_History>;
};

/** on_conflict condition type for table "user_login_history" */
export type User_Login_History_On_Conflict = {
  constraint: User_Login_History_Constraint;
  update_columns?: Array<User_Login_History_Update_Column>;
  where?: InputMaybe<User_Login_History_Bool_Exp>;
};

/** Ordering options when selecting data from "user_login_history". */
export type User_Login_History_Order_By = {
  created_by?: InputMaybe<Order_By>;
  created_date?: InputMaybe<Order_By>;
  device_info?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_deleted?: InputMaybe<Order_By>;
  login_time?: InputMaybe<Order_By>;
  logout_time?: InputMaybe<Order_By>;
  master_user?: InputMaybe<Master_User_Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_date?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_login_history */
export type User_Login_History_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user_login_history" */
export enum User_Login_History_Select_Column {
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DeviceInfo = 'device_info',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LoginTime = 'login_time',
  /** column name */
  LogoutTime = 'logout_time',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  UserAgent = 'user_agent',
  /** column name */
  UserId = 'user_id'
}

/** select "user_login_history_aggregate_bool_exp_bool_and_arguments_columns" columns of table "user_login_history" */
export enum User_Login_History_Select_Column_User_Login_History_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** select "user_login_history_aggregate_bool_exp_bool_or_arguments_columns" columns of table "user_login_history" */
export enum User_Login_History_Select_Column_User_Login_History_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted'
}

/** input type for updating data in table "user_login_history" */
export type User_Login_History_Set_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  login_time?: InputMaybe<Scalars['timestamptz']['input']>;
  logout_time?: InputMaybe<Scalars['timestamptz']['input']>;
  token_id?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "user_login_history" */
export type User_Login_History_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Login_History_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Login_History_Stream_Cursor_Value_Input = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  created_date?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  login_time?: InputMaybe<Scalars['timestamptz']['input']>;
  logout_time?: InputMaybe<Scalars['timestamptz']['input']>;
  token_id?: InputMaybe<Scalars['String']['input']>;
  updated_by?: InputMaybe<Scalars['uuid']['input']>;
  updated_date?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "user_login_history" */
export enum User_Login_History_Update_Column {
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  CreatedDate = 'created_date',
  /** column name */
  DeviceInfo = 'device_info',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDeleted = 'is_deleted',
  /** column name */
  LoginTime = 'login_time',
  /** column name */
  LogoutTime = 'logout_time',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  UpdatedDate = 'updated_date',
  /** column name */
  UserAgent = 'user_agent',
  /** column name */
  UserId = 'user_id'
}

export type User_Login_History_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Login_History_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Login_History_Bool_Exp;
};

/** columns and relationships of "users" */
export type Users = {
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  password: Scalars['String']['output'];
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  username: Scalars['String']['output'];
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  password?: InputMaybe<String_Comparison_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  username?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey',
  /** unique or primary key constraint on columns "username" */
  UsersUsernameKey = 'users_username_key'
}

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  username?: InputMaybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Password = 'password',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Username = 'username'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Password = 'password',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Username = 'username'
}

export type Users_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Users_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};
