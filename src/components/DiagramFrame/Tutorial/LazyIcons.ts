type IconModule = { default: string };
type IconLoader = () => Promise<IconModule>;

const coreIcons: Record<string, IconLoader> = {
  actor: () => import("../../../assets/actor.svg?raw"),
  boundary: () => import("../../../assets/Robustness_Diagram_Boundary.svg?raw"),
  control: () => import("../../../assets/Robustness_Diagram_Control.svg?raw"),
  database: () => import("../../../assets/database.svg?raw"),
  entity: () => import("../../../assets/Robustness_Diagram_Entity.svg?raw"),
  cognito: () =>
    import(
      "../../../assets/Architecture-Service-Icons_09172021/Arch_Security-Identity-Compliance/16/Arch_Amazon-Cognito_16.svg?raw"
    ),
  elasticbeantalk: () =>
    import(
      "../../../assets/Architecture-Service-Icons_09172021/Arch_Compute/16/Arch_AWS-Elastic-Beanstalk_16.svg?raw"
    ),
  kinesis: () =>
    import(
      "../../../assets/Architecture-Service-Icons_09172021/Arch_Analytics/Arch_16/Arch_Amazon-Kinesis_16.svg?raw"
    ),
  lightsail: () =>
    import(
      "../../../assets/Architecture-Service-Icons_09172021/Arch_Compute/16/Arch_Amazon-Lightsail_16.svg?raw"
    ),
  sagemaker: () =>
    import(
      "../../../assets/Architecture-Service-Icons_09172021/Arch_Machine-Learning/16/Arch_Amazon-SageMaker_16.svg?raw"
    ),
};

const loadCloudIcon = async (key: string): Promise<string | null> => {
  const { cloudIcons } = await import("./CloudIcons");
  return cloudIcons[key] ?? null;
};

export const loadIcon = async (iconKey: string): Promise<string | null> => {
  if (!iconKey) return null;

  const normalizedKey = iconKey.toLowerCase();
  const coreLoader = coreIcons[iconKey] ?? coreIcons[normalizedKey];
  if (coreLoader) {
    return (await coreLoader()).default;
  }

  return loadCloudIcon(normalizedKey);
};
