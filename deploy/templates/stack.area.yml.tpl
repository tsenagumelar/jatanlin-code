services:
  postgres:
    image: ${POSTGRES_IMAGE}
    container_name: jtn-${AREA_CODE}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "${POSTGRES_PORT}:5432"
    volumes:
      - jtn_${AREA_CODE}_postgres_data:/var/lib/postgresql/data
    networks:
      - jtn-net

  minio:
    image: ${MINIO_IMAGE}
    container_name: jtn-${AREA_CODE}-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "${MINIO_API_PORT}:9000"
      - "${MINIO_CONSOLE_PORT}:9001"
    volumes:
      - jtn_${AREA_CODE}_minio_data:/data
    networks:
      - jtn-net

  nats:
    image: ${NATS_IMAGE}
    container_name: jtn-${AREA_CODE}-nats
    restart: unless-stopped
    command: ["-js", "--user", "${NATS_USER}", "--pass", "${NATS_PASSWORD}"]
    ports:
      - "${NATS_PORT}:4222"
    volumes:
      - jtn_${AREA_CODE}_nats_data:/data
    networks:
      - jtn-net

  ftp:
    image: ${FTP_IMAGE}
    container_name: jtn-${AREA_CODE}-ftp
    restart: unless-stopped
    environment:
      USERS: ${ANPR_FTP_USER}|${ANPR_FTP_PASS}
      ADDRESS: 0.0.0.0
    ports:
      - "${FTP_PORT}:21"
      - "21100-21110:21100-21110"
    volumes:
      - jtn_${AREA_CODE}_ftp_data:/home/vsftpd
    networks:
      - jtn-net

  hasura:
    image: ${HASURA_IMAGE}
    container_name: jtn-${AREA_CODE}-hasura
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      HASURA_GRAPHQL_DATABASE_URL: ${HASURA_GRAPHQL_DATABASE_URL}
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "false"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup,http-log,webhook-log,websocket-log,query-log
      HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET}
      HASURA_GRAPHQL_JWT_SECRET: ${HASURA_GRAPHQL_JWT_SECRET}
    ports:
      - "${HASURA_PORT}:8080"
    networks:
      - jtn-net

  web:
    image: ${WEB_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-web
    restart: unless-stopped
    depends_on:
      - hasura
    environment:
      NEXT_PUBLIC_HASURA_URL: http://localhost:${HASURA_PORT}/v1/graphql
      NEXT_PUBLIC_HASURA_WS_IP: ws://localhost:${HASURA_PORT}/v1/graphql
      NEXT_PUBLIC_HASURA_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET}
    ports:
      - "${WEB_PORT}:3000"
    networks:
      - jtn-net

  api-service:
    image: ${GENERAL_API_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-api-service
    restart: unless-stopped
    depends_on:
      - postgres
      - minio
      - nats
    environment:
      SERVICE: api
      SITE_CODE: ${SITE_CODE}
      SITE_NAME: ${SITE_NAME}
      SITE_LOCATION: ${SERVICE_SITE_LOCATION}
      SITE_REGION: ${SITE_REGION}
      DATABASE_URL: ${DATABASE_URL}
      API_PORT: "4000"
      JWT_SECRET: ${JWT_SECRET}
      AUTH_ENABLED: ${AUTH_ENABLED}
      NATS_URL: ${NATS_URL}
      ANPR_FTP_HOST: ${ANPR_FTP_HOST}
      ANPR_FTP_USER: ${ANPR_FTP_USER}
      ANPR_FTP_PASS: ${ANPR_FTP_PASS}
      ANPR_FTP_DIR: ${ANPR_FTP_DIR}
      ANPR_FTP_INTERVAL_SEC: "${ANPR_FTP_INTERVAL_SEC}"
      AXLE_FTP_HOST: ${AXLE_FTP_HOST}
      AXLE_FTP_USER: ${AXLE_FTP_USER}
      AXLE_FTP_PASS: ${AXLE_FTP_PASS}
      AXLE_FTP_DIR: ${AXLE_FTP_DIR}
      AXLE_FTP_INTERVAL_SEC: "${AXLE_FTP_INTERVAL_SEC}"
      ANPR_MINIO_ENDPOINT: minio:9000
      ANPR_MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      ANPR_MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      ANPR_MINIO_BUCKET: ${ANPR_MINIO_BUCKET}
      ANPR_MINIO_USE_SSL: "false"
      AXLE_MINIO_ENDPOINT: minio:9000
      AXLE_MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      AXLE_MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      AXLE_MINIO_BUCKET: ${AXLE_MINIO_BUCKET}
      AXLE_MINIO_USE_SSL: "false"
      ATTACHMENT_MINIO_ENDPOINT: minio:9000
      ATTACHMENT_MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      ATTACHMENT_MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      ATTACHMENT_MINIO_BUCKET: ${ATTACHMENT_MINIO_BUCKET}
      ATTACHMENT_MINIO_USE_SSL: "false"
      DIMENSION_ENABLED: "true"
      RTSP_URL: ${RTSP_URL}
      WEIGHING_TRIGGER_URL: http://wb-service:5000/ws/wim/anpr-capture
      WEIGHING_TRIGGER_DUMMY: "${WEIGHING_TRIGGER_DUMMY}"
      CCTV_TRIGGER_URL: http://cctv-service:8090/record
      CCTV_TRIGGER_DUMMY: "${CCTV_TRIGGER_DUMMY}"
    ports:
      - "${API_PORT}:4000"
    networks:
      - jtn-net

  anpr-service:
    image: ${ANPR_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-anpr-service
    restart: unless-stopped
    depends_on:
      - api-service
    environment:
      SERVICE: anpr-watcher
      SITE_CODE: ${SITE_CODE}
      SITE_NAME: ${SITE_NAME}
      SITE_LOCATION: ${SERVICE_SITE_LOCATION}
      SITE_REGION: ${SITE_REGION}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NATS_URL: ${NATS_URL}
      ANPR_FTP_HOST: ${ANPR_FTP_HOST}
      ANPR_FTP_USER: ${ANPR_FTP_USER}
      ANPR_FTP_PASS: ${ANPR_FTP_PASS}
      ANPR_FTP_DIR: ${ANPR_FTP_DIR}
      ANPR_FTP_INTERVAL_SEC: "${ANPR_FTP_INTERVAL_SEC}"
      ANPR_DUMMY_ENABLED: "${ANPR_DUMMY_ENABLED}"
      ANPR_MINIO_ENDPOINT: minio:9000
      ANPR_MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      ANPR_MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      ANPR_MINIO_BUCKET: ${ANPR_MINIO_BUCKET}
      ANPR_MINIO_USE_SSL: "false"
      DIMENSION_ENABLED: "true"
      WEIGHING_TRIGGER_URL: http://wb-service:5000/ws/wim/anpr-capture
      WEIGHING_TRIGGER_DUMMY: "${WEIGHING_TRIGGER_DUMMY}"
      CCTV_TRIGGER_URL: http://cctv-service:8090/record
      CCTV_TRIGGER_DUMMY: "${CCTV_TRIGGER_DUMMY}"
    networks:
      - jtn-net

  axle-service:
    image: ${AXLE_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-axle-service
    restart: unless-stopped
    depends_on:
      - api-service
    environment:
      SERVICE: axle-watcher
      SITE_CODE: ${SITE_CODE}
      SITE_NAME: ${SITE_NAME}
      SITE_LOCATION: ${SERVICE_SITE_LOCATION}
      SITE_REGION: ${SITE_REGION}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NATS_URL: ${NATS_URL}
      AXLE_FTP_HOST: ${AXLE_FTP_HOST}
      AXLE_FTP_USER: ${AXLE_FTP_USER}
      AXLE_FTP_PASS: ${AXLE_FTP_PASS}
      AXLE_FTP_DIR: ${AXLE_FTP_DIR}
      AXLE_FTP_INTERVAL_SEC: "${AXLE_FTP_INTERVAL_SEC}"
      AXLE_DUMMY_ENABLED: "${AXLE_DUMMY_ENABLED}"
      AXLE_MINIO_ENDPOINT: minio:9000
      AXLE_MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      AXLE_MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      AXLE_MINIO_BUCKET: ${AXLE_MINIO_BUCKET}
      AXLE_MINIO_USE_SSL: "false"
    networks:
      - jtn-net

  cctv-service:
    image: ${CCTV_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-cctv-service
    restart: unless-stopped
    depends_on:
      - api-service
    environment:
      SERVICE: cctv-streamer
      SITE_CODE: ${SITE_CODE}
      SITE_NAME: ${SITE_NAME}
      SITE_LOCATION: ${SERVICE_SITE_LOCATION}
      SITE_REGION: ${SITE_REGION}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NATS_URL: ${NATS_URL}
      RTSP_URL: ${RTSP_URL}
      CCTV_TRIGGER_DUMMY: "${CCTV_TRIGGER_DUMMY}"
    networks:
      - jtn-net

  wb-service:
    image: ${WB_IMAGE}
    platform: ${SERVICE_PLATFORM}
    container_name: jtn-${AREA_CODE}-wb-service
    restart: unless-stopped
    depends_on:
      - postgres
      - nats
    environment:
      ASPNETCORE_URLS: http://+:5000
      ConnectionStrings__VehicleDatabase: Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
      Nats__Url: ${NATS_URL}
    ports:
      - "${WB_PORT}:5000"
    networks:
      - jtn-net

networks:
  jtn-net:
    name: ${NETWORK_NAME}

volumes:
  jtn_${AREA_CODE}_postgres_data:
  jtn_${AREA_CODE}_minio_data:
  jtn_${AREA_CODE}_nats_data:
  jtn_${AREA_CODE}_ftp_data:
