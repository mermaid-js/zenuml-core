import actor from "../../../assets/actor.svg?raw";
import boundary from "../../../assets/Robustness_Diagram_Boundary.svg?raw";
import control from "../../../assets/Robustness_Diagram_Control.svg?raw";
import database from "../../../assets/database.svg?raw";
import entity from "../../../assets/Robustness_Diagram_Entity.svg?raw";
// AWS
import cognito from "../../../assets/Architecture-Service-Icons_09172021/Arch_Security-Identity-Compliance/16/Arch_Amazon-Cognito_16.svg?raw";
import efs from "../../../assets/Architecture-Service-Icons_09172021/Arch_Storage/16/Arch_Amazon-Elastic-File-System_16.svg?raw";
import elasticache from "../../../assets/Architecture-Service-Icons_09172021/Arch_Database/16/Arch_Amazon-ElastiCache_16.svg?raw";
import elasticbeantalk from "../../../assets/Architecture-Service-Icons_09172021/Arch_Compute/16/Arch_AWS-Elastic-Beanstalk_16.svg?raw";
import elasticfilesystem from "../../../assets/Architecture-Service-Icons_09172021/Arch_Storage/16/Arch_Amazon-Elastic-File-System_16.svg?raw";
import glacier from "../../../assets/Architecture-Service-Icons_09172021/Arch_Storage/16/Arch_Amazon-Simple-Storage-Service-Glacier_16.svg?raw";
import iam from "../../../assets/Architecture-Service-Icons_09172021/Arch_Security-Identity-Compliance/16/Arch_AWS-Identity-and-Access-Management_16.svg?raw";
import kinesis from "../../../assets/Architecture-Service-Icons_09172021/Arch_Analytics/Arch_16/Arch_Amazon-Kinesis_16.svg?raw";
import lambda from "../../../assets/Architecture-Service-Icons_09172021/Arch_Compute/16/Arch_AWS-Lambda_16.svg?raw";
import lightsail from "../../../assets/Architecture-Service-Icons_09172021/Arch_Compute/16/Arch_Amazon-Lightsail_16.svg?raw";
import rds from "../../../assets/Architecture-Service-Icons_09172021/Arch_Database/16/Arch_Amazon-RDS_16.svg?raw";
import redshift from "../../../assets/Architecture-Service-Icons_09172021/Arch_Analytics/Arch_16/Arch_Amazon-Redshift_16.svg?raw";
import s3 from "../../../assets/Architecture-Service-Icons_09172021/Arch_Storage/16/Arch_Amazon-Simple-Storage-Service_16.svg?raw";
import sns from "../../../assets/Architecture-Service-Icons_09172021/Arch_App-Integration/Arch_16/Arch_Amazon-Simple-Notification-Service_16.svg?raw";
import sqs from "../../../assets/Architecture-Service-Icons_09172021/Arch_App-Integration/Arch_16/Arch_Amazon-Simple-Queue-Service_16.svg?raw";
import sagemaker from "../../../assets/Architecture-Service-Icons_09172021/Arch_Machine-Learning/16/Arch_Amazon-SageMaker_16.svg?raw";
import vpc from "../../../assets/Architecture-Service-Icons_09172021/Arch_Networking-Content-Delivery/16/Arch_Amazon-Virtual-Private-Cloud_16.svg?raw";
import awsiotlora from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_LoRaWAN-Protocol_48.svg?raw";
import awsiotgreengrasscomponent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Component_48.svg?raw";
import awsiotthingcoffeepot from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Coffee-Pot_48.svg?raw";
import awsiotlambda from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Lambda_Function_48.svg?raw";
import awsiotthingwindfarm from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Windfarm_48.svg?raw";
import awsiotthingvibrationsensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Vibration-Sensor_48.svg?raw";
import awsiotdevicedefenderjobs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Device-Defender_IoT-Device-Jobs_48.svg?raw";
import awsiotdevicemanagementfleethub from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Device-Management_Fleet-Hub_48.svg?raw";
import awsiottopic from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Topic_48.svg?raw";
import awsiotcertificate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Certificate_48.svg?raw";
import awsiotthingrelay from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Relay_48.svg?raw";
import awsiotanalyticschannel from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Analytics_Channel_48.svg?raw";
import awsiotthingcamera from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Camera_48.svg?raw";
import awsiotthingdoorlock from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Door-Lock_48.svg?raw";
import awsiotpolicy from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Policy_48.svg?raw";
import awsiotthingfreertos from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_FreeRTOS-Device_48.svg?raw";
import awsiotsitewiseassetproperties from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-SiteWise_Asset-Properties_48.svg?raw";
import awsiotthingtempvibrationsensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Temperature-Vibration-Sensor_48.svg?raw";
import awsiotthingplc from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_PLC_48.svg?raw";
import awsiotaction from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Action_48.svg?raw";
import awsiotalexavoice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Alexa_Voice-Service_48.svg?raw";
import awsiotalexaenabled from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Alexa_Enabled-Device_48.svg?raw";
import awsiotthingutility from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Utility_48.svg?raw";
import awsiotactuator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Actuator_48.svg?raw";
import awsiotthingtempsensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Temperature-Sensor_48.svg?raw";
import awsiothttpprotocol from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_HTTP_Protocol_48.svg?raw";
import awsiotcoredevicelocation from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Core_Device-Location_48.svg?raw";
import awsiotalexaskill from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Alexa_Skill_48.svg?raw";
import awsiotanalyticsnotebook from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Analytics_Notebook_48.svg?raw";
import awsiothardwareboard from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Hardware-Board_48.svg?raw";
import awsiotthingcar from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Car_48.svg?raw";
import awsiotthinglightbulb from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Lightbulb_48.svg?raw";
import awsiotsitewiseasset from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-SiteWise_Asset_48.svg?raw";
import awsiotsitewisedatastreams from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-SiteWise_Data-Streams_48.svg?raw";
import awsiotgreengrasscomponentnucleus from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Component-Nucleus_48.svg?raw";
import awsiotthinghouse from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_House_48.svg?raw";
import awsiotoverairupdate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Over-Air-Update_48.svg?raw";
import awsiotthingbank from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Bank_48.svg?raw";
import awsiotsensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Sensor_48.svg?raw";
import awsiotsitewiseassethierarchy from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-SiteWise_Asset-Hierarchy_48.svg?raw";
import awsiotgreengrassartifact from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Artifact_48.svg?raw";
import awsiotthingtravel from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Travel_48.svg?raw";
import awsiotmqttprotocol from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_MQTT_Protocol_48.svg?raw";
import awsiotshadow from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Shadow_48.svg?raw";
import awsiotfiretv from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Fire_TV_48.svg?raw";
import awsiotgreengrassconnector from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Connector_48.svg?raw";
import awsiotgreengrassipc from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Interprocess-Communication_48.svg?raw";
import awsiothttp2protocol from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_HTTP2-Protocol_48.svg?raw";
import awsiotfiretvstick from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Fire-TV_Stick_48.svg?raw";
import awsiotcoredeviceadvisor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Core_Device-Advisor_48.svg?raw";
import awsiotthingindustrialpc from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Industrial-PC_48.svg?raw";
import awsiotdesiredstate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Desired-State_48.svg?raw";
import awsiotecho from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Echo_48.svg?raw";
import awsiotgreengrassrecipe from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Recipe_48.svg?raw";
import awsiotgreengrasscomponentprivate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Component-Private_48.svg?raw";
import awsiotgreengrassstreammanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Stream-Manager_48.svg?raw";
import awsiotthingmedicalemergency from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Medical-Emergency_48.svg?raw";
import awsiotthingthermostat from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Thermostat_48.svg?raw";
import awsiotsitewiseassetmodel from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-SiteWise_Asset-Model_48.svg?raw";
import awsiotthingstacklight from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Stacklight_48.svg?raw";
import awsiotthingtemphumiditysensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Temperature-Humidity-Sensor_48.svg?raw";
import awsiotgreengrasscomponentpublic from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Component-Public_48.svg?raw";
import awsiotsailboat from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Sailboat_48.svg?raw";
import awsiotrule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Rule_48.svg?raw";
import awsiotthingbicycle from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Bicycle_48.svg?raw";
import awsiotreportedstate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Reported-State_48.svg?raw";
import awsiotsimulator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Simulator_48.svg?raw";
import awsiotthingpoliceemergency from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Police-Emergency_48.svg?raw";
import awsiotanalyticsdatastore from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Analytics_Data-Store_48.svg?raw";
import awsiotdevicetester from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Device-Tester_48.svg?raw";
import awsiotanalyticspipeline from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Analytics_Pipeline_48.svg?raw";
import awsiotthingfactory from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Factory_48.svg?raw";
import awsiotthinghumiditysensor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Humidity-Sensor_48.svg?raw";
import awsiotgreengrassprotocol from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Protocol_48.svg?raw";
import awsiotservo from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Servo_48.svg?raw";
import awsiotanalyticsdataset from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Analytics_Dataset_48.svg?raw";
import awsiotgreengrassmachinelearning from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT-Greengrass_Component-Machine-Learning_48.svg?raw";
import awsiotthinggeneric from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Generic_48.svg?raw";
import awsiotdevicegateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Device-Gateway_48.svg?raw";
import awsiotthingcart from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_IoT/Res_AWS-IoT_Thing_Cart_48.svg?raw";
import amazonrekognitionvideo from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-Rekognition_Video_48.svg?raw";
import amazonsagemakermodel from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Model_48.svg?raw";
import amazonsagemakeranalyzelending from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-Textract_Analyze-Lending_48.svg?raw";
import amazonsagemakershadowtesting from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Shadow-Testing_48.svg?raw";
import amazondevopsguruinsights from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-DevOps-Guru_Insights_48.svg?raw";
import amazonsagemakernotebook from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Notebook_48.svg?raw";
import amazonsagemakercanvas from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Canvas_48.svg?raw";
import amazonsagemakertrain from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Train_48.svg?raw";
import amazonsagemakergeospatialml from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-SageMaker_Geospatial-ML_48.svg?raw";
import amazonrekognitionimage from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Machine-Learning/Res_Amazon-Rekognition_Image_48.svg?raw";
import amazonbraketsimulator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Embedded-Simulator_48.svg?raw";
import amazonbraketnoisesimulator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Noise-Simulator_48.svg?raw";
import amazonbraketchip from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Chip_48.svg?raw";
import amazonbraketsimulator1 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Simulator-1_48.svg?raw";
import amazonbraketmanagedsimulator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Managed-Simulator_48.svg?raw";
import amazonbraketsimulator3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Simulator-3_48.svg?raw";
import amazonbraketchandelier from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Chandelier_48.svg?raw";
import amazonbrakettensornetwork from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Tensor-Network_48.svg?raw";
import amazonbraketsimulator4 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Simulator-4_48.svg?raw";
import amazonbraketqpu from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_QPU_48.svg?raw";
import amazonbraketstatevector from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_State-Vector_48.svg?raw";
import amazonbraketsimulator2 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Quantum-Technologies/Res_Amazon-Braket_Simulator-2_48.svg?raw";
import amazonopensearchobservability from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_Observability_48.svg?raw";
import amazonredshiftra3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_RA3_48.svg?raw";
import amazonredshiftstreaming from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Streaming-Ingestion_48.svg?raw";
import amazonemrengine from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-EMR_EMR-Engine_48.svg?raw";
import amazonredshiftqueryeditor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Query-Editor-v2.0_48.svg?raw";
import amazonehrhdfscluster from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-EMR_HDFS-Cluster_48.svg?raw";
import amazonmskconnect from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-MSK_Amazon-MSK-Connect_48.svg?raw";
import awsgluedatacatalog from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Glue_Data-Catalog_48.svg?raw";
import amazondatzonedataportal from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-DataZone_Data-Portal_48.svg?raw";
import amazondatzonebusinessdatacatalog from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-DataZone_Business-Data-Catalog_48.svg?raw";
import amazondatzonedataprojects from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-DataZone_Data-Projects_48.svg?raw";
import amazonredshiftdensestorage from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Dense-Storage-Node_48.svg?raw";
import awsgluedataquality from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Glue_Data-Quality_48.svg?raw";
import awsgluecrawler from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Glue_Crawler_48.svg?raw";
import amazonquicksightreports from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Quicksight_Paginated-Reports_48.svg?raw";
import awslakeformationdatalake from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Lake-Formation_Data-Lake_48.svg?raw";
import amazonopensearchultrawarm from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_UltraWarm-Node_48.svg?raw";
import amazoncloudsearchsearchdocuments from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-CloudSearch_Search-Documents_48.svg?raw";
import amazonopensearchingestion from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_OpenSearch-Ingestion_48.svg?raw";
import amazonathenadatasource from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Athena_Data-Source-Connectors_48.svg?raw";
import amazonopensearchadminnode from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_Cluster-Administrator-Node_48.svg?raw";
import amazonopensearchdashboards from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_OpenSearch-Dashboards_48.svg?raw";
import amazonopensearchindex from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_Index_48.svg?raw";
import awsglueray from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Glue_AWS-Glue-for-Ray_48.svg?raw";
import amazonredshiftdatasharing from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Data-Sharing-Governance_48.svg?raw";
import amazonredshiftautocopy from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Auto-copy_48.svg?raw";
import amazonredshiftdensecompute from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_Dense-Compute-Node_48.svg?raw";
import amazonredshiftml from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-Redshift_ML_48.svg?raw";
import amazonopensearchtraces from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_Traces_48.svg?raw";
import amazonemrcluster from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-EMR_Cluster_48.svg?raw";
import amazonopensearchdatanode from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_Amazon-OpenSearch-Service_Data-Node_48.svg?raw";
import awsdataexchangeapi from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Analytics/Res_AWS-Data-Exchange-for-APIs_48.svg?raw";
import amazonworkspaces from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_End-User-Computing/Res_Amazon-WorkSpaces-Family_Amazon-WorkSpaces_48.svg?raw";
import amazonworkspacescore from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_End-User-Computing/Res_Amazon-WorkSpaces-Family_Amazon-WorkSpaces-Core_48.svg?raw";
import amazonworkspacesweb from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_End-User-Computing/Res_Amazon-WorkSpaces-Family_Amazon-WorkSpaces-Web_48.svg?raw";
import awsdirservicesimplead from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Directory-Service_Simple-AD_48.svg?raw";
import awswafbadbot from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Bad-Bot_48.svg?raw";
import awsidentityaccesssts from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_AWS-STS_48.svg?raw";
import awsidentityaccessaddon from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Add-on_48.svg?raw";
import amazoninspectoragent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_Amazon-Inspector_Agent_48.svg?raw";
import awsidentityaccessdataencryption from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Encrypted-Data_48.svg?raw";
import awsidentityaccessmfatoken from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_MFA-Token_48.svg?raw";
import awsdirserviceadconnector from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Directory-Service_AD-Connector_48.svg?raw";
import awsidentityaccesspermissions from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Permissions_48.svg?raw";
import awswaflabels from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Labels_48.svg?raw";
import awscertmgrca from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Certificate-Manager_Certificate-Authority_48.svg?raw";
import awsidentityaccessstsalt from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_AWS-STS-Alternate_48.svg?raw";
import awsdirservicemanagedmsad from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Directory-Service_AWS-Managed-Microsoft-AD_48.svg?raw";
import awssecurityhubfinding from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Security-Hub_Finding_48.svg?raw";
import awswafrule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Rule_48.svg?raw";
import awsidentityaccessrole from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Role_48.svg?raw";
import awsidentityaccesslongtermcredential from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Long-Term-Security-Credential_48.svg?raw";
import awsidentityaccesstempcredential from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Temporary-Security-Credential_48.svg?raw";
import awswaffilteringrule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Filtering-Rule_48.svg?raw";
import awswafbot from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Bot_48.svg?raw";
import awsshieldadvanced from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Shield_AWS-Shield-Advanced_48.svg?raw";
import awsidentityaccessanalyzer from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_IAM-Access-Analyzer_48.svg?raw";
import awswafbotcontrol from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Bot-Control_48.svg?raw";
import awsidentityaccessrolesanywhere from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_IAM-Roles-Anywhere_48.svg?raw";
import awsidentityaccessdataencryptionkey from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_Data-Encryption-Key_48.svg?raw";
import awsnetworkfirewallendpoints from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Network-Firewall_Endpoints_48.svg?raw";
import awswafmanagedrule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-WAF_Managed-Rule_48.svg?raw";
import awskeymanagementexternalkeystore from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Key-Management-Service_External-Key-Store_48.svg?raw";
import amazonblockchain from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Blockchain/Res_Amazon-Managed-Blockchain_Blockchain_48.svg?raw";
import amazoneventbridgesaas from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Saas-Partner-Event_48.svg?raw";
import amazoneventbridgeschema from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Schema_48.svg?raw";
import amazonmqbroker from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-MQ_Broker_48.svg?raw";
import amazoneventbridgeschemaregistry from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Schema-Registry_48.svg?raw";
import amazoneventbridgedefaultbus from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Default-Event-Bus_48.svg?raw";
import amazonsnsnotification from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Notification-Service_Email-Notification_48.svg?raw";
import amazoneventbridgeevent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge-Event_48.svg?raw";
import amazonnshttpnotification from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Notification-Service_HTTP-Notification_48.svg?raw";
import amazoneventbridgepipes from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Pipes_48.svg?raw";
import amazoneventbridgerule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Rule_48.svg?raw";
import amazonapigatewayendpoint from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-API-Gateway_Endpoint_48.svg?raw";
import amazoneventbridgescheduler from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Scheduler_48.svg?raw";
import amazonsqsqueue from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Queue-Service_Queue_48.svg?raw";
import amazonsqsmessage from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Queue-Service_Message_48.svg?raw";
import amazoneventbridgecustomeventbus from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-EventBridge_Custom-Event-Bus_48.svg?raw";
import amazonsnstopic from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Notification-Service_Topic_48.svg?raw";
import awsssmpatchmanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Patch-Manager_48.svg?raw";
import awscloudformationtemplate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-CloudFormation_Template_48.svg?raw";
import awsopsworkslayers from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Layers_48.svg?raw";
import amazoncloudwatchmetricsinsights from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Metrics-Insights_48.svg?raw";
import amazoncloudwatchdataprotection from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Data-Protection_48.svg?raw";
import amazoncloudwatchalarm from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Alarm_48.svg?raw";
import awstrustedadvisorchecksecurity from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Trusted-Advisor_Checklist-Security_48.svg?raw";
import awstrustedadvisorcheckperformance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Trusted-Advisor_Checklist-Performance_48.svg?raw";
import amazoncloudwatchrule from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Rule_48.svg?raw";
import awsopsworksresources from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Resources_48.svg?raw";
import amazoncloudwatcheventtime from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Event-Time-Based_48.svg?raw";
import awsorgsmanagementaccount from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Organizations_Management-Account_48.svg?raw";
import awslicensemanagerlicenseblending from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-License-Manager_License-Blending_48.svg?raw";
import amazoncloudwatcheventevent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Event-Event-Based_48.svg?raw";
import amazoncloudwatchsynthetics from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Synthetics_48.svg?raw";
import awsssmstatemanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_State-Manager_48.svg?raw";
import awscloudformationstack from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-CloudFormation_Stack_48.svg?raw";
import awsopsworksinstances from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Instances_48.svg?raw";
import awsssmruncommand from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Run-Command_48.svg?raw";
import awsopsworksdeployments from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Deployments_48.svg?raw";
import awsssmautomation from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Automation_48.svg?raw";
import awsssmchangecalendar from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Change-Calendar_48.svg?raw";
import awsorgsorganizationalunit from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Organizations_Organizational-Unit_48.svg?raw";
import awsssmsessionmanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Session-Manager_48.svg?raw";
import awstrustedadvisorcheckcost from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Trusted-Advisor_Checklist-Cost_48.svg?raw";
import awsopsworksstack2 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Stack2_48.svg?raw";
import awslicensemanagerapplicationdiscovery from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-License-Manager_Application-Discovery_48.svg?raw";
import awsssmopscenter from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_OpsCenter_48.svg?raw";
import awsssminventory from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Inventory_48.svg?raw";
import awsopsworkspermissions from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Permissions_48.svg?raw";
import awsopsworksapps from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Apps_48.svg?raw";
import awscloudformationchangeset from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-CloudFormation_Change-Set_48.svg?raw";
import awsssmdocuments from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Documents_48.svg?raw";
import awsssmapplicationmanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Application-Manager_48.svg?raw";
import awsorgsaccount from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Organizations_Account_48.svg?raw";
import awscloudtrailcloudtraillake from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-CloudTrail_CloudTrail-Lake_48.svg?raw";
import awsssmmaintenancewindows from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Maintenance-Windows_48.svg?raw";
import awssmmincidentmanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Incident-Manager_48.svg?raw";
import amazoncloudwatchevidently from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Evidently_48.svg?raw";
import amazoncloudwatchrum from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_RUM_48.svg?raw";
import awsssmparameterstore from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Parameter-Store_48.svg?raw";
import amazoncloudwatchlogs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Logs_48.svg?raw";
import cloudwatch from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Logs_48.svg?raw";

import awsssmchangemanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Change-Manager_48.svg?raw";
import awsopsworksmonitoring from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-OpsWorks_Monitoring_48.svg?raw";
import awsssmcompliance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Compliance_48.svg?raw";
import awsssmdistributor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Systems-Manager_Distributor_48.svg?raw";
import amazoncloudwatchobservability from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_Amazon-CloudWatch_Cross-account-Observability_48.svg?raw";
import awstrustedadvisorcheckfault from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Trusted-Advisor_Checklist-Fault-Tolerant_48.svg?raw";
import awstrustedadvisorchecklist from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Management-Governance/Res_AWS-Trusted-Advisor_Checklist_48.svg?raw";
import amazonroute53routetable from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Route-Table_48.svg?raw";
import amazoncloudfrontdistribution from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Download-Distribution_48.svg?raw";
import amazonroute53routingcontrols from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Routing-Controls_48.svg?raw";
import amazonroute53arc from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Route-53-Application-Recovery-Controller_48.svg?raw";
import amazonvpctrafficmirroring from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Traffic-Mirroring_48.svg?raw";
import amazonvpcreachabilityanalyzer from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Reachability-Analyzer_48.svg?raw";
import awscloudmapnamespace from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-Map_Namespace_48.svg?raw";
import awstransitgatewayattachment from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Transit-Gateway_Attachment_48.svg?raw";
import amazonvpcigw from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Internet-Gateway_48.svg?raw";
import amazoncloudfrontedgelocation from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Edge-Location_48.svg?raw";
import awscloudwansegmentnetwork from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-WAN_Segment-Network_48.svg?raw";
import awscloudmapservice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-Map_Service_48.svg?raw";
import awsappmeshvirtualrouter from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-App-Mesh_Virtual-Router_48.svg?raw";
import amazonvpcendpoints from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Endpoints_48.svg?raw";
import amazonvpcvpnconnection from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_VPN-Connection_48.svg?raw";
import amazoncloudfrontstreaming from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Streaming-Distribution_48.svg?raw";
import amazonvpcpeering from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Peering-Connection_48.svg?raw";
import amazonroute53resolverdnsfirewall from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Resolver-DNS-Firewall_48.svg?raw";
import amazonroute53hostedzone from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53-Hosted-Zone_48.svg?raw";
import amazonvpcvpngateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_VPN-Gateway_48.svg?raw";
import amazoncloudfrontfunctions from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Functions_48.svg?raw";
import cloudfront from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Functions_48.svg?raw";
import amazoneaelasticnetworkadapter from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Elastic-Network-Adapter_48.svg?raw";
import awsappmeshvirtualgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-App-Mesh_Virtual-Gateway_48.svg?raw";
import amazonroute53resolverlogging from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Resolver-Query-Logging_48.svg?raw";
import elasticlbclassic from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Classic-Load-Balancer_48.svg?raw";
import amazonroute53resolver from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Resolver_48.svg?raw";
import awscloudwancorenetworkedge from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-WAN_Core-Network-Edge_48.svg?raw";
import awsappmeshvirtualservice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-App-Mesh_Virtual-Service_48.svg?raw";
import amazonvpcflowlogs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Flow-Logs_48.svg?raw";
import awscloudmapresource from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-Map_Resource_48.svg?raw";
import awsdirectconnectgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Direct-Connect_Gateway_48.svg?raw";
import amazonvpcnetworkaccessanalyzer from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Network-Access-Analyzer_48.svg?raw";
import elasticlbapp from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg?raw";
import amazonvpcvpc from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Virtual-private-cloud-VPC_48.svg?raw";
import amazonvpccarriergateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Carrier-Gateway_48.svg?raw";
import amazoneaelasticnetworkinterface from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Elastic-Network-Interface_48.svg?raw";
import awscloudwanrouteattachment from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-Cloud-WAN_Transit-Gateway-Route-Table-Attachment_48.svg?raw";
import amazonroute53readiness from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Readiness-Checks_48.svg?raw";
import awsappmeshvirtualnode from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-App-Mesh_Virtual-Node_48.svg?raw";
import elasticlbgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Gateway-Load-Balancer_48.svg?raw";
import amazonvpcrouter from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Router_48.svg?raw";
import awsappmeshmesh from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_AWS-App-Mesh_Mesh_48.svg?raw";
import amazonvpcnatgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_NAT-Gateway_48.svg?raw";
import amazonvpcnetworkacl from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Network-Access-Control-List_48.svg?raw";
import amazonvpccustomer from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Amazon-VPC_Customer-Gateway_48.svg?raw";
import elasticlbnetwork from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Network-Load-Balancer_48.svg?raw";
import amazons3replication from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Replication_48.svg?raw";
import amazons3onezone from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-One-Zone-IA_48.svg?raw";
import awsbackuplegalhold from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Legal-Hold_48.svg?raw";
import awsstoragegateaway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Noncached-Volume_48.svg?raw";
import amazonefsstandard from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_EFS-Standard_48.svg?raw";
import amazons3bucket from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_Bucket-With-Objects_48.svg?raw";
import awsstoragegateawayfile from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_File-Gateway_48.svg?raw";
import awsfsxfile from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Amazon-FSx-File-Gateway_48.svg?raw";
import amazons3glacierinstant from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Glacier-Instant-Retrieval_48.svg?raw";
import amazonfilecache from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-File-Cache_On-premises-NFS-linked-datasets_48.svg?raw";
import amazons3standardia from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Standard-IA_48.svg?raw";
import amazons3generalaccess from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_General-Access-Points_48.svg?raw";
import amazons3lambda from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Object-Lambda-Access-Points_48.svg?raw";
import amazons3objectlock from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Object-Lock_48.svg?raw";
import awsbackupvirtualmachine from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Virtual-Machine_48.svg?raw";
import amazonec2gp3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Volume-gp3_48.svg?raw";
import amazonefsfilesys from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_File-System_48.svg?raw";
import awssnowballimportexport from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Snowball_Snowball-Import-Export_48.svg?raw";
import amazons3object from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_Object_48.svg?raw";
import awsbackupcache from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Cached-Volume_48.svg?raw";
import amazons3lambdaobject from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Object-Lambda_48.svg?raw";
import awsbackupgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Gateway_48.svg?raw";
import awsbackuprto from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Recovery-Time-Objective_48.svg?raw";
import awsbackupvaultlock from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Vault-Lock_48.svg?raw";
import awsbackupvirtualtape from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Virtual-Tape-Library_48.svg?raw";
import amazonebsdatalifecycle from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Amazon-Data-Lifecycle-Manager_48.svg?raw";
import awsbackupplan from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Backup-Plan_48.svg?raw";
import amazonfilecaches3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-File-Cache_S3-linked-datasets_48.svg?raw";
import awsbackupcloudformation from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_AWS-Backup-for-AWS-CloudFormation_48.svg?raw";
import awsbackuptapegateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Tape-Gateway_48.svg?raw";
import awsbackupvmware from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_AWS-Backup-Support-for-VMware-Workloads_48.svg?raw";
import amazonefsonezoneia from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_EFS-One-Zone-Infrequent-Access_48.svg?raw";
import amazons3replicationtime from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Replication-Time-Control_48.svg?raw";
import awsbackupstorage from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Storage_48.svg?raw";
import amazonefsintelligenttiering from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_EFS-Intelligent-Tiering_48.svg?raw";
import amazons3glacierdeep from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Glacier-Deep-Archive_48.svg?raw";
import amazons3select from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Select_48.svg?raw";
import amazons3outposts from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-On-Outposts_48.svg?raw";
import awsfilegateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Amazon-S3-File-Gateway_48.svg?raw";
import amazons3glacier from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service-Glacier_Archive_48.svg?raw";
import awsbackupvmmonitor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Virtual-Machine-Monitor_48.svg?raw";
import amazons3multiregion from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Multi-Region-Access-Points_48.svg?raw";
import awsbackupvault from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Backup-Vault_48.svg?raw";
import awsbackupauditmanager from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Audit-Manager_48.svg?raw";
import amazonfilecachehybridnfs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-File-Cache_Hybrid-NFS-linked-datasets_48.svg?raw";
import amazonefselasticthroughput from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_Elastic-Throughput_48.svg?raw";
import awsbackupawsbackupfors3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_AWS-Backup-support-for-Amazon-S3_48.svg?raw";
import amazons3standard from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Standard_48.svg?raw";
import amazonefsonezone from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_EFS-One-Zone_48.svg?raw";
import awsstoragegateawayvolume from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Storage-Gateway_Volume-Gateway_48.svg?raw";
import awsbackuprestore from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Backup-Restore_48.svg?raw";
import amazonebsvolumes from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Multiple-Volumes_48.svg?raw";
import amazons3lens from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Storage-Lens_48.svg?raw";
import awsbackupcompute from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Compute_48.svg?raw";
import amazonvpclogs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_VPC-Access-Points_48.svg?raw";
import amazons3batch from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Batch-Operations_48.svg?raw";
import amazonefsinfrequent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-File-System_EFS-Standard-Infrequent-Access_48.svg?raw";
import amazons3tiering from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Intelligent-Tiering_48.svg?raw";
import awsbackuprpo from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Recovery-Point-Objective_48.svg?raw";
import awsbackupcompliance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Compliance-Reporting_48.svg?raw";
import amazonebssnapshot from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Snapshot_48.svg?raw";
import awsbackupdatabase from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_Database_48.svg?raw";
import awsbackupfsx from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_AWS-Backup_AWS-Backup-support-for-Amazon-FSx-for-NetApp-ONTAP_48.svg?raw";
import amazons3glacierflex from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Glacier-Flexible-Retrieval_48.svg?raw";
import amazons3bucketobject from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service_Bucket_48.svg?raw";
import amazonebsvolume from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Volume_48.svg?raw";
import ebs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Elastic-Block-Store_Volume_48.svg?raw";
import amazons3vault from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Storage/Res_Amazon-Simple-Storage-Service-Glacier_Vault_48.svg?raw";
import amazoneksoutposts from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Kubernetes-Service_EKS-on-Outposts_48.svg?raw";
import amazonecscontainer2 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Container-2_48.svg?raw";
import amazonecrimage from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Registry_Image_48.svg?raw";
import amazonecstask from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Task_48.svg?raw";
import amazonecsservice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Service_48.svg?raw";
import amazonecscontainer1 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Container-1_48.svg?raw";
import amazonecrregistry from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Registry_Registry_48.svg?raw";
import amazonecscontainer3 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Container-3_48.svg?raw";
import ecs from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_Container-3_48.svg?raw";
import amazonecscopilotcli from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_CopiIoT-CLI_48.svg?raw";
import amazonecsserviceconnect from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Containers/Res_Amazon-Elastic-Container-Service_ECS-Service-Connect_48.svg?raw";
import amazonec2extractor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_AWS-Microservice-Extractor-for-.NET_48.svg?raw";
import amazonec2ami from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_AMI_48.svg?raw";
import awselasticbeanstalkdeployment from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_AWS-Elastic-Beanstalk_Deployment_48.svg?raw";
import awslambdafunction from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_AWS-Lambda_Lambda-Function_48.svg?raw";
import amazonec2instance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Instance_48.svg?raw";
import ec2 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Instance_48.svg?raw";
import amazonec2autoscaling from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Auto-Scaling_48.svg?raw";
import amazonec2spotinstance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Spot-Instance_48.svg?raw";
import awselasticbeanstalkapp from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_AWS-Elastic-Beanstalk_Application_48.svg?raw";
import amazonec2instancecloudwatch from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Instance-with-CloudWatch_48.svg?raw";
import amazonec2rescue from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Rescue_48.svg?raw";
import amazonec2instances from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Instances_48.svg?raw";
import amazonec2dbinstance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_DB-Instance_48.svg?raw";
import amazonec2elasticip from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Compute/Res_Amazon-EC2_Elastic-IP-Address_48.svg?raw";
import amazonrdsoptimizedwrites from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS_Optimized-Writes_48.svg?raw";
import amazondynamodbtblclass from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Standard-Access-Table-Class_48.svg?raw";
import amazonrdsinstancealternate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora_Amazon-RDS-Instance-Aternate_48.svg?raw";
import amazondynamodbattributes from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Attributes_48.svg?raw";
import amazonrdsauroramysqlalternative from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-MySQL-Instance-Alternate_48.svg?raw";
import amazondynamodbitem from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Item_48.svg?raw";
import amazonrdsaurorapgsqlalt from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-PostgreSQL-Instance-Alternate_48.svg?raw";
import amazondynamodbitems from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Items_48.svg?raw";
import amazonrdsauroraalternate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora_Amazon-Aurora-Instance-alternate_48.svg?raw";
import amazonrdsaurorasqlalt from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-SQL-Server-Instance-Alternate_48.svg?raw";
import amazonrdsinstance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora_Amazon-RDS-Instance_48.svg?raw";
import amazonrdsmultiaz from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS_Multi-AZ_48.svg?raw";
import amazondocdbelasticclusters from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DocumentDB_Elastic-Clusters_48.svg?raw";
import amazonrdstrustedextpgsql from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS_Trusted-Language-Extensions-for-PostgreSQL_48.svg?raw";
import amazonrdsaurorasql from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-SQL-Server-Instance_48.svg?raw";
import amazondynamodbglobal from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Global-secondary-index_48.svg?raw";
import amazonrdsoracle from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-Oracle-Instance_48.svg?raw";
import amazonrdsoraclealternate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-Oracle-Instance-Alternate_48.svg?raw";
import amazondynamodbstream from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Stream_48.svg?raw";
import amazonrdstrustedpgsql from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora_Trusted-Language-Extensions-for-PostgreSQL_48.svg?raw";
import amazondax from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Amazon-DynamoDB-Accelerator_48.svg?raw";
import amazonelasticache4redis from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-ElastiCache_ElastiCache-for-Redis_48.svg?raw";
import amazonrdsproxy from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS-Proxy-Instance_48.svg?raw";
import amazondynamodbaccesstable from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Standard-Infrequent-Access-Table-Class_48.svg?raw";
import amazonrdsauroramysql from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-MySQL-Instance_48.svg?raw";
import amazonrdspiops from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-PIOPS-Instance_48.svg?raw";
import awsdbmigrationserviceworkflow from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_AWS-Database-Migration-Service_Database-migration-workflow-or-job_48.svg?raw";
import amazondynamodbattribute from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Attribute_48.svg?raw";
import amazonrdsbluegreendeploy from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS_Blue-Green-Deployments_48.svg?raw";
import amazondynamodbtable from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Table_48.svg?raw";
import dynamodb from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-DynamoDB_Table_48.svg?raw";
import amazonrdsaurorainstance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-Instance_48.svg?raw";
import amazonrdsauroradbinstance from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-MariaDB-Instance_48.svg?raw";
import amazonelasticache4memcached from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-ElastiCache_ElastiCache-for-Memcached_48.svg?raw";
import amazonrdsproxyalternate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS-Proxy-Instance-Alternate_48.svg?raw";
import amazonrdsaurorapgsql from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-PostgreSQL-Instance_48.svg?raw";
import amazonrdsauroradbinstancealternate from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-Aurora-MariaDB-Instance-Alternate_48.svg?raw";
import amazonelasticachecachenode from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-ElastiCache_Cache-Node_48.svg?raw";
import amazonrdsmultiazcluster from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Database/Res_Amazon-RDS_Multi-AZ-DB-Cluster_48.svg?raw";
import awstransferfamilyftps from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Transfer-Family_AWS-FTPS_48.svg?raw";
import awstransferfamilysftp from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Transfer-Family_AWS-SFTP_48.svg?raw";
import awsmainframemodruntime from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Mainframe-Modernization_Runtime_48.svg?raw";
import awstransferfamilyftp from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Transfer-Family_AWS-FTP_48.svg?raw";
import awsmigrationhubrefactor from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Migration-Hub_Refactor-Spaces-Environments_48.svg?raw";
import awsmainframemoddeveloper from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Mainframe-Modernization_Developer_48.svg?raw";
import awsdiscoveryagent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Application-Discovery-Service_AWS-Discovery-Agent_48.svg?raw";
import awsmainframemodcompiler from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Mainframe-Modernization_Compiler_48.svg?raw";
import awsmigrationhubrefactorapp from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Migration-Hub_Refactor-Spaces-Applications_48.svg?raw";
import awsdiscoveryagentlesscollector from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Application-Discovery-Service_AWS-Agentless-Collector_48.svg?raw";
import awsmainframemodanalyzer from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Mainframe-Modernization_Analyzer_48.svg?raw";
import awsdatasyndiscovery from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-DataSync_Discovery_48.svg?raw";
import awsmigrationhubrefactorservice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Migration-Hub_Refactor-Spaces-Services_48.svg?raw";
import awsdatasyngagent from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Datasync_Agent_48.svg?raw";
import awsmainframemodconverter from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Mainframe-Modernization_Converter_48.svg?raw";
import awstransferfamilyas2 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Transfer-Family_AWS-AS2_48.svg?raw";
import awsdiscoverymigrationevaluator from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Migration-Transfer/Res_AWS-Application-Discovery-Service_Migration-Evaluator-Collector_48.svg?raw";
import awscloudinterface from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Media-Services/Res_AWS-Cloud-Digital-Interface_48.svg?raw";
import awsmediaconnectgateway from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Media-Services/Res_AWS-Elemental-MediaConnect_MediaConnect-Gateway_48.svg?raw";
import awsrobomakercloudextensions from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Robotics/Res_AWS-RoboMaker_Cloud-Extensions-ROS_48.svg?raw";
import awsrobomakersimulation from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Robotics/Res_AWS-RoboMaker_Simulation_48.svg?raw";
import awsrobomakerfleetmanagement from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Robotics/Res_AWS-RoboMaker_Fleet-Management_48.svg?raw";
import awsrobomakerdevenv from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Robotics/Res_AWS-RoboMaker_Development-Environment_48.svg?raw";
import awsamplifystudio from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_AWS-Amplify_AWS-Amplify-Studio_48.svg?raw";
import amazonlocationmap from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_Amazon-Location-Service_Map _48.svg?raw";
import amazonlocationplace from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_Amazon-Location-Service_Place_48.svg?raw";
import amazonlocationtrack from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_Amazon-Location-Service_Track _48.svg?raw";
import amazonlocationgeofence from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_Amazon-Location-Service_Geofence_48.svg?raw";
import amazonlocationroutes from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Front-End-Web-Mobile/Res_Amazon-Location-Service_Routes_48.svg?raw";
import awscloud9 from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Developer-Tools/Res_AWS-Cloud9_Cloud9_48.svg?raw";
import amazonemailservice from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Business-Applications/Res_Amazon-Simple-Email-Service_Email_48.svg?raw";
import amazonpinpointjourney from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Business-Applications/Res_Amazon-Pinpoint_Journey_48.svg?raw";

// Azure
import azureactivedirectory from "../../../assets/Azure_Public_Service_Icons/Icons/Identity/10221-icon-service-Azure-Active-Directory.svg?raw";
import azurebackup from "../../../assets/Azure_Public_Service_Icons/Icons/Azure Stack/10108-icon-service-Infrastructure-Backup.svg?raw";
import azurecdn from "../../../assets/Azure_Public_Service_Icons/Icons/App Services/00056-icon-service-CDN-Profiles.svg?raw";
import azuredatafactory from "../../../assets/Azure_Public_Service_Icons/Icons/Databases/10126-icon-service-Data-Factory.svg?raw";
import azuredevops from "../../../assets/Azure_Public_Service_Icons/Icons/DevOps/10261-icon-service-Azure-DevOps.svg?raw";
import azurefunction from "../../../assets/Azure_Public_Service_Icons/Icons/Compute/10029-icon-service-Function-Apps.svg?raw";
import azuresql from "../../../assets/Azure_Public_Service_Icons/Icons/Databases/02390-icon-service-Azure-SQL.svg?raw";
import cosmosdb from "../../../assets/Azure_Public_Service_Icons/Icons/Databases/10121-icon-service-Azure-Cosmos-DB.svg?raw";
import logicapps from "../../../assets/Azure_Public_Service_Icons/Icons/Integration/10201-icon-service-Logic-Apps.svg?raw";
import virtualmachine from "../../../assets/Azure_Public_Service_Icons/Icons/Compute/10021-icon-service-Virtual-Machine.svg?raw";
// GCP
import bigtable from "../../../assets/google-cloud-icons/bigtable/bigtable.svg?raw";
import bigquery from "../../../assets/google-cloud-icons/bigquery/bigquery.svg?raw";
import cloudcdn from "../../../assets/google-cloud-icons/cloud_cdn/cloud_cdn.svg?raw";
import clouddns from "../../../assets/google-cloud-icons/cloud_dns/cloud_dns.svg?raw";
import cloudinterconnect from "../../../assets/google-cloud-icons/cloud_interconnect/cloud_interconnect.svg?raw";
import cloudloadbalancing from "../../../assets/google-cloud-icons/cloud_load_balancing/cloud_load_balancing.svg?raw";
import cloudsql from "../../../assets/google-cloud-icons/cloud_sql/cloud_sql.svg?raw";
import cloudstorage from "../../../assets/google-cloud-icons/cloud_storage/cloud_storage.svg?raw";
import datalab from "../../../assets/google-cloud-icons/datalab/datalab.svg?raw";
import dataproc from "../../../assets/google-cloud-icons/dataproc/dataproc.svg?raw";
import googleiam from "../../../assets/google-cloud-icons/identity_and_access_management/identity_and_access_management.svg?raw";
import googlesecurity from "../../../assets/google-cloud-icons/security/security.svg?raw";
import googlevpc from "../../../assets/google-cloud-icons/virtual_private_cloud/virtual_private_cloud.svg?raw";
import pubsub from "../../../assets/google-cloud-icons/pubsub/pubsub.svg?raw";
import securityscanner from "../../../assets/google-cloud-icons/cloud_security_scanner/cloud_security_scanner.svg?raw";
import stackdriver from "../../../assets/google-cloud-icons/stackdriver/stackdriver.svg?raw";
import visionapi from "../../../assets/google-cloud-icons/cloud_vision_api/cloud_vision_api.svg?raw";

// HLD - Generic Architecture
import client from "../../../assets/HLD-Architecture/client.svg?raw";
import server from "../../../assets/HLD-Architecture/server.svg?raw";
import browser from "../../../assets/HLD-Architecture/browser.svg?raw";
import service from "../../../assets/HLD-Architecture/service.svg?raw";
import controller from "../../../assets/HLD-Architecture/controller.svg?raw";
import api from "../../../assets/HLD-Architecture/api.svg?raw";
import ui from "../../../assets/HLD-Architecture/ui.svg?raw";
import mobile from "../../../assets/HLD-Architecture/mobile.svg?raw";
import externalsystem from "../../../assets/HLD-Architecture/external_system.svg?raw";

// secondary participants
import application from "../../../assets/HLD-Architecture/application.svg?raw";
import loadbalancer from "../../../assets/HLD-Architecture/load_balancer.svg?raw";
import network from "../../../assets/HLD-Architecture/network.svg?raw";
import cache from "../../../assets/HLD-Architecture/cache.svg?raw";
import webserver from "../../../assets/HLD-Architecture/web_server.svg?raw";
import messagequeue from "../../../assets/HLD-Architecture/message_queue.svg?raw";
import scheduler from "../../../assets/HLD-Architecture/scheduler.svg?raw";
import gateway from "../../../assets/HLD-Architecture/gateway.svg?raw";
import authenticationservice from "../../../assets/HLD-Architecture/authentication_service.svg?raw";
import mailserver from "../../../assets/HLD-Architecture/mail_server.svg?raw";

//common application and services
import github from "../../../assets/HLD-Architecture/github.svg?raw";
import docker from "../../../assets/HLD-Architecture/docker.svg?raw";
import gitlab from "../../../assets/HLD-Architecture/gitlab.svg?raw";
import jenkins from "../../../assets/HLD-Architecture/jenkins.svg?raw";
import postgresql from "../../../assets/HLD-Architecture/postgresql.svg?raw";
import mongodb from "../../../assets/HLD-Architecture/mongodb.svg?raw";
import kubernetes from "../../../assets/HLD-Architecture/kubernetes.svg?raw";
import apachekafka from "../../../assets/HLD-Architecture/apachekafka.svg?raw";
import elasticsearch from "../../../assets/HLD-Architecture/elastic_search.svg?raw";
import auth0 from "../../../assets/HLD-Architecture/auth0.svg?raw";
import redis from "../../../assets/HLD-Architecture/redis.svg?raw";

export default {
  actor,
  boundary,
  control,
  database,
  entity,
  awsiotlora,
  awsiotgreengrasscomponent,
  cloudwatch,
  cloudfront,
  cognito,
  dynamodb,
  ebs,
  ec2,
  ecs,
  efs,
  elasticache,
  elasticbeantalk,
  elasticfilesystem,
  glacier,
  iam,
  kinesis,
  lambda,
  lightsail,
  rds,
  redshift,
  s3,
  sns,
  sqs,
  sagemaker,
  vpc,
  awsiotthingcoffeepot,
  awsiotlambda,
  awsiotthingwindfarm,
  awsiotthingvibrationsensor,
  awsiotdevicedefenderjobs,
  awsiotdevicemanagementfleethub,
  awsiottopic,
  awsiotcertificate,
  awsiotthingrelay,
  awsiotanalyticschannel,
  awsiotthingcamera,
  awsiotthingdoorlock,
  awsiotpolicy,
  awsiotthingfreertos,
  awsiotsitewiseassetproperties,
  awsiotthingtempvibrationsensor,
  awsiotthingplc,
  awsiotaction,
  awsiotalexavoice,
  awsiotalexaenabled,
  awsiotthingutility,
  awsiotactuator,
  awsiotthingtempsensor,
  awsiothttpprotocol,
  awsiotcoredevicelocation,
  awsiotalexaskill,
  awsiotanalyticsnotebook,
  awsiothardwareboard,
  awsiotthingcar,
  awsiotthinglightbulb,
  awsiotsitewiseasset,
  awsiotsitewisedatastreams,
  awsiotgreengrasscomponentnucleus,
  awsiotthinghouse,
  awsiotoverairupdate,
  awsiotthingbank,
  awsiotsensor,
  awsiotsitewiseassethierarchy,
  awsiotgreengrassartifact,
  awsiotthingtravel,
  awsiotmqttprotocol,
  awsiotshadow,
  awsiotfiretv,
  awsiotgreengrassconnector,
  awsiotgreengrassipc,
  awsiothttp2protocol,
  awsiotfiretvstick,
  awsiotcoredeviceadvisor,
  awsiotthingindustrialpc,
  awsiotdesiredstate,
  awsiotecho,
  awsiotgreengrassrecipe,
  awsiotgreengrasscomponentprivate,
  awsiotgreengrassstreammanager,
  awsiotthingmedicalemergency,
  awsiotthingthermostat,
  awsiotsitewiseassetmodel,
  awsiotthingstacklight,
  awsiotthingtemphumiditysensor,
  awsiotgreengrasscomponentpublic,
  awsiotsailboat,
  awsiotrule,
  awsiotthingbicycle,
  awsiotreportedstate,
  awsiotsimulator,
  awsiotthingpoliceemergency,
  awsiotanalyticsdatastore,
  awsiotdevicetester,
  awsiotanalyticspipeline,
  awsiotthingfactory,
  awsiotthinghumiditysensor,
  awsiotgreengrassprotocol,
  awsiotservo,
  awsiotanalyticsdataset,
  awsiotgreengrassmachinelearning,
  awsiotthinggeneric,
  awsiotdevicegateway,
  awsiotthingcart,
  amazonrekognitionvideo,
  amazonsagemakermodel,
  amazonsagemakeranalyzelending,
  amazonsagemakershadowtesting,
  amazondevopsguruinsights,
  amazonsagemakernotebook,
  amazonsagemakercanvas,
  amazonsagemakertrain,
  amazonsagemakergeospatialml,
  amazonrekognitionimage,
  amazonbraketsimulator,
  amazonbraketnoisesimulator,
  amazonbraketchip,
  amazonbraketsimulator1,
  amazonbraketmanagedsimulator,
  amazonbraketsimulator3,
  amazonbraketchandelier,
  amazonbrakettensornetwork,
  amazonbraketsimulator4,
  amazonbraketqpu,
  amazonbraketstatevector,
  amazonbraketsimulator2,
  amazonopensearchobservability,
  amazonredshiftra3,
  amazonredshiftstreaming,
  amazonemrengine,
  amazonredshiftqueryeditor,
  amazonehrhdfscluster,
  amazonmskconnect,
  awsgluedatacatalog,
  amazondatzonedataportal,
  amazondatzonebusinessdatacatalog,
  amazondatzonedataprojects,
  amazonredshiftdensestorage,
  awsgluedataquality,
  awsgluecrawler,
  amazonquicksightreports,
  awslakeformationdatalake,
  amazonopensearchultrawarm,
  amazoncloudsearchsearchdocuments,
  amazonopensearchingestion,
  amazonathenadatasource,
  amazonopensearchadminnode,
  amazonopensearchdashboards,
  amazonopensearchindex,
  awsglueray,
  amazonredshiftdatasharing,
  amazonredshiftautocopy,
  amazonredshiftdensecompute,
  amazonredshiftml,
  amazonopensearchtraces,
  amazonemrcluster,
  amazonopensearchdatanode,
  awsdataexchangeapi,
  amazonworkspaces,
  amazonworkspacescore,
  amazonworkspacesweb,
  awsdirservicesimplead,
  awswafbadbot,
  awsidentityaccesssts,
  awsidentityaccessaddon,
  amazoninspectoragent,
  awsidentityaccessdataencryption,
  awsidentityaccessmfatoken,
  awsdirserviceadconnector,
  awsidentityaccesspermissions,
  awswaflabels,
  awscertmgrca,
  awsidentityaccessstsalt,
  awsdirservicemanagedmsad,
  awssecurityhubfinding,
  awswafrule,
  awsidentityaccessrole,
  awsidentityaccesslongtermcredential,
  awsidentityaccesstempcredential,
  awswaffilteringrule,
  awswafbot,
  awsshieldadvanced,
  awsidentityaccessanalyzer,
  awswafbotcontrol,
  awsidentityaccessrolesanywhere,
  awsidentityaccessdataencryptionkey,
  awsnetworkfirewallendpoints,
  awswafmanagedrule,
  awskeymanagementexternalkeystore,
  amazonblockchain,
  amazoneventbridgesaas,
  amazoneventbridgeschema,
  amazonmqbroker,
  amazoneventbridgeschemaregistry,
  amazoneventbridgedefaultbus,
  amazonsnsnotification,
  amazoneventbridgeevent,
  amazonnshttpnotification,
  amazoneventbridgepipes,
  amazoneventbridgerule,
  amazonapigatewayendpoint,
  amazoneventbridgescheduler,
  amazonsqsqueue,
  amazonsqsmessage,
  amazoneventbridgecustomeventbus,
  amazonsnstopic,
  awsssmpatchmanager,
  awscloudformationtemplate,
  awsopsworkslayers,
  amazoncloudwatchmetricsinsights,
  amazoncloudwatchdataprotection,
  amazoncloudwatchalarm,
  awstrustedadvisorchecksecurity,
  awstrustedadvisorcheckperformance,
  amazoncloudwatchrule,
  awsopsworksresources,
  amazoncloudwatcheventtime,
  awsorgsmanagementaccount,
  awslicensemanagerlicenseblending,
  amazoncloudwatcheventevent,
  amazoncloudwatchsynthetics,
  awsssmstatemanager,
  awscloudformationstack,
  awsopsworksinstances,
  awsssmruncommand,
  awsopsworksdeployments,
  awsssmautomation,
  awsssmchangecalendar,
  awsorgsorganizationalunit,
  awsssmsessionmanager,
  awstrustedadvisorcheckcost,
  awsopsworksstack2,
  awslicensemanagerapplicationdiscovery,
  awsssmopscenter,
  awsssminventory,
  awsopsworkspermissions,
  awsopsworksapps,
  awscloudformationchangeset,
  awsssmdocuments,
  awsssmapplicationmanager,
  awsorgsaccount,
  awscloudtrailcloudtraillake,
  awsssmmaintenancewindows,
  awssmmincidentmanager,
  amazoncloudwatchevidently,
  amazoncloudwatchrum,
  awsssmparameterstore,
  amazoncloudwatchlogs,
  awsssmchangemanager,
  awsopsworksmonitoring,
  awsssmcompliance,
  awsssmdistributor,
  amazoncloudwatchobservability,
  awstrustedadvisorcheckfault,
  awstrustedadvisorchecklist,
  amazonroute53routetable,
  amazoncloudfrontdistribution,
  amazonroute53routingcontrols,
  amazonroute53arc,
  amazonvpctrafficmirroring,
  amazonvpcreachabilityanalyzer,
  awscloudmapnamespace,
  awstransitgatewayattachment,
  amazonvpcigw,
  amazoncloudfrontedgelocation,
  awscloudwansegmentnetwork,
  awscloudmapservice,
  awsappmeshvirtualrouter,
  amazonvpcendpoints,
  amazonvpcvpnconnection,
  amazoncloudfrontstreaming,
  amazonvpcpeering,
  amazonroute53resolverdnsfirewall,
  amazonroute53hostedzone,
  amazonvpcvpngateway,
  amazoncloudfrontfunctions,
  amazoneaelasticnetworkadapter,
  awsappmeshvirtualgateway,
  amazonroute53resolverlogging,
  elasticlbclassic,
  amazonroute53resolver,
  awscloudwancorenetworkedge,
  awsappmeshvirtualservice,
  amazonvpcflowlogs,
  awscloudmapresource,
  awsdirectconnectgateway,
  amazonvpcnetworkaccessanalyzer,
  elasticlbapp,
  amazonvpcvpc,
  amazonvpccarriergateway,
  amazoneaelasticnetworkinterface,
  awscloudwanrouteattachment,
  amazonroute53readiness,
  awsappmeshvirtualnode,
  elasticlbgateway,
  amazonvpcrouter,
  awsappmeshmesh,
  amazonvpcnatgateway,
  amazonvpcnetworkacl,
  amazonvpccustomer,
  elasticlbnetwork,
  amazons3replication,
  amazons3onezone,
  awsbackuplegalhold,
  awsstoragegateaway,
  amazonefsstandard,
  amazons3bucket,
  awsstoragegateawayfile,
  awsfsxfile,
  amazons3glacierinstant,
  amazonfilecache,
  amazons3standardia,
  amazons3generalaccess,
  amazons3lambda,
  amazons3objectlock,
  awsbackupvirtualmachine,
  amazonec2gp3,
  amazonefsfilesys,
  awssnowballimportexport,
  amazons3object,
  awsbackupcache,
  amazons3lambdaobject,
  awsbackupgateway,
  awsbackuprto,
  awsbackupvaultlock,
  awsbackupvirtualtape,
  amazonebsdatalifecycle,
  awsbackupplan,
  amazonfilecaches3,
  awsbackupcloudformation,
  awsbackuptapegateway,
  awsbackupvmware,
  amazonefsonezoneia,
  amazons3replicationtime,
  awsbackupstorage,
  amazonefsintelligenttiering,
  amazons3glacierdeep,
  amazons3select,
  amazons3outposts,
  awsfilegateway,
  amazons3glacier,
  awsbackupvmmonitor,
  amazons3multiregion,
  awsbackupvault,
  awsbackupauditmanager,
  amazonfilecachehybridnfs,
  amazonefselasticthroughput,
  awsbackupawsbackupfors3,
  amazons3standard,
  amazonefsonezone,
  awsstoragegateawayvolume,
  awsbackuprestore,
  amazonebsvolumes,
  amazons3lens,
  awsbackupcompute,
  amazonvpclogs,
  amazons3batch,
  amazonefsinfrequent,
  amazons3tiering,
  awsbackuprpo,
  awsbackupcompliance,
  amazonebssnapshot,
  awsbackupdatabase,
  awsbackupfsx,
  amazons3glacierflex,
  amazons3bucketobject,
  amazonebsvolume,
  amazons3vault,
  amazoneksoutposts,
  amazonecscontainer2,
  amazonecrimage,
  amazonecstask,
  amazonecsservice,
  amazonecscontainer1,
  amazonecrregistry,
  amazonecscontainer3,
  amazonecscopilotcli,
  amazonecsserviceconnect,
  amazonec2extractor,
  amazonec2ami,
  awselasticbeanstalkdeployment,
  awslambdafunction,
  amazonec2instance,
  amazonec2autoscaling,
  amazonec2spotinstance,
  awselasticbeanstalkapp,
  amazonec2instancecloudwatch,
  amazonec2rescue,
  amazonec2instances,
  amazonec2dbinstance,
  amazonec2elasticip,
  amazonrdsoptimizedwrites,
  amazondynamodbtblclass,
  amazonrdsinstancealternate,
  amazondynamodbattributes,
  amazonrdsauroramysqlalternative,
  amazondynamodbitem,
  amazonrdsaurorapgsqlalt,
  amazondynamodbitems,
  amazonrdsauroraalternate,
  amazonrdsaurorasqlalt,
  amazonrdsinstance,
  amazonrdsmultiaz,
  amazondocdbelasticclusters,
  amazonrdstrustedextpgsql,
  amazonrdsaurorasql,
  amazondynamodbglobal,
  amazonrdsoracle,
  amazonrdsoraclealternate,
  amazondynamodbstream,
  amazonrdstrustedpgsql,
  amazondax,
  amazonelasticache4redis,
  amazonrdsproxy,
  amazondynamodbaccesstable,
  amazonrdsauroramysql,
  amazonrdspiops,
  awsdbmigrationserviceworkflow,
  amazondynamodbattribute,
  amazonrdsbluegreendeploy,
  amazondynamodbtable,
  amazonrdsaurorainstance,
  amazonrdsauroradbinstance,
  amazonelasticache4memcached,
  amazonrdsproxyalternate,
  amazonrdsaurorapgsql,
  amazonrdsauroradbinstancealternate,
  amazonelasticachecachenode,
  amazonrdsmultiazcluster,
  awstransferfamilyftps,
  awstransferfamilysftp,
  awsmainframemodruntime,
  awstransferfamilyftp,
  awsmigrationhubrefactor,
  awsmainframemoddeveloper,
  awsdiscoveryagent,
  awsmainframemodcompiler,
  awsmigrationhubrefactorapp,
  awsdiscoveryagentlesscollector,
  awsmainframemodanalyzer,
  awsdatasyndiscovery,
  awsmigrationhubrefactorservice,
  awsdatasyngagent,
  awsmainframemodconverter,
  awstransferfamilyas2,
  awsdiscoverymigrationevaluator,
  awscloudinterface,
  awsmediaconnectgateway,
  awsrobomakercloudextensions,
  awsrobomakersimulation,
  awsrobomakerfleetmanagement,
  awsrobomakerdevenv,
  awsamplifystudio,
  amazonlocationmap,
  amazonlocationplace,
  amazonlocationtrack,
  amazonlocationgeofence,
  amazonlocationroutes,
  awscloud9,
  amazonemailservice,
  amazonpinpointjourney,

  azureactivedirectory,
  azurebackup,
  azurecdn,
  azuredatafactory,
  azuredevops,
  azurefunction,
  azuresql,
  cosmosdb,
  logicapps,
  virtualmachine,
  bigtable,
  bigquery,
  cloudcdn,
  clouddns,
  cloudinterconnect,
  cloudloadbalancing,
  cloudsql,
  cloudstorage,
  datalab,
  dataproc,
  googleiam,
  googlesecurity,
  googlevpc,
  pubsub,
  securityscanner,
  stackdriver,
  visionapi,
  client,
  server,
  browser,
  service,
  controller,
  api,
  ui,
  mobile,
  externalsystem,
  application,
  loadbalancer,
  network,
  cache,
  webserver,
  messagequeue,
  scheduler,
  gateway,
  authenticationservice,
  mailserver,
  github,
  docker,
  gitlab,
  jenkins,
  postgresql,
  mongodb,
  kubernetes,
  apachekafka,
  elasticsearch,
  auth0,
  redis,
};
