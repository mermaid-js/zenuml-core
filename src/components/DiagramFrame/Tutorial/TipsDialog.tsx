import Icon from "@/components/Icon/Icons";
import { showTipsAtom } from "@/store/Store";
import { useSetAtom } from "jotai";
import { IconList } from "./IconList";

const standardTypes = ["Actor", "Boundary", "Control", "Database", "Entity"];
const awsServices = [
  "CloudWatch",
  "CloudFront",
  "Cognito",
  "DynamoDB",
  "EBS",
  "EC2",
  "ECS",
  "EFS",
  "ElastiCache",
  "ElasticBeantalk",
  "ElasticFileSystem",
  "Glacier",
  "IAM",
  "Kinesis",
  "Lambda",
  "LightSail",
  "RDS",
  "Redshift",
  "S3",
  "SNS",
  "SQS",
  "Sagemaker",
  "VPC",
];
const azureServices = [
  "AzureActiveDirectory",
  "AzureBackup",
  "AzureCDN",
  "AzureDataFactory",
  "AzureDevOps",
  "AzureFunction",
  "AzureSQL",
  "CosmosDB",
  "LogicApps",
  "VirtualMachine",
];
const googleServices = [
  "BigTable",
  "BigQuery",
  "CloudCDN",
  "CloudDNS",
  "CloudInterconnect",
  "CloudLoadBalancing",
  "CloudSQL",
  "CloudStorage",
  "DataLab",
  "DataProc",
  "GoogleIAM",
  "GoogleSecurity",
  "GoogleVPC",
  "PubSub",
  "SecurityScanner",
  "StackDriver",
  "VisionAPI",
];

const code1 = `// Define a Starter (optional)
@Starter(A)

// Show icons
@EC2 A

// Use 'group' keyword
group GroupName &#123;  B  C &#125;

// Use alias
S as Service

// Use stereotype
&lt;&lt;servlet&gt;&gt; ServiceX`;
const code2 = `A.method()
==divider name==
B.method()
`;
const code3 = `// Alt (AKA if/else)
if(condition1) {}
else if (condition2) {}
else {}

// \`loop\`, \`for\`, \`forEach\`, \`while\`
// are treated the same
forEach(records) {}

// Opt
opt {}

// Par
par {}

// Section
section(ID) {} / frame(ID) {};

// Critical
critical {}

// Try Catch Finally
try {} catch() {} finally {}
`;
const code4 = `
//Creation
new ParticipantName()

//Sync Message
A.method
A->B.method

//Async Message
A->B: async message

//Reply Message, three styles
x = A.method
A.method() {
  return x
}
A.method() {
  @return A->B: message
}`;

export const TipsDialog = () => {
  const setShowTips = useSetAtom(showTipsAtom);

  const closeTipsDialog = () => {
    setShowTips(false);
    // try {
    //   this.$gtag?.event("close", {
    //     event_category: "help",
    //     event_label: "tips dialog",
    //   });
    // } catch (e) {
    //   console.error(e);
    // }
  };

  return (
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>

      {/* This element is to trick the browser into centering the modal contents. */}
      <span
        className="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
      >
        &#8203;
      </span>

      <div className="z-40 inline-block align-bottom bg-white rounded-lg px-4 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-2">
        <div>
          <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-xl leading-6 font-medium text-gray-900 inline-block">
              ZenUML Tips
            </h3>
            <button
              type="button"
              onClick={closeTipsDialog}
              className="float-right bg-white rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Close menu</span>
              {/* Heroicon name: outline/x */}
              <Icon name="close" className="h-6 w-6 outline-none" />
            </button>
          </div>
          <div>
            <div className="relative bg-white pb-32 mt-4 overflow-hidden">
              <div className="relative">
                <div className="lg:mx-auto lg:max-w-11/12 lg:px-8">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
                    <div>
                      <div className="px-4 max-w-full mx-auto sm:px-6 lg:max-w-none lg:mx-0">
                        <h2 className="mt-4 mb-4 text-lg leading-6 font-medium text-gray-900">
                          Declare Participants
                        </h2>
                        <pre className="text-xs w-full bg-gray-50 text-gray-600 p-2 rounded-lg">
                          <code>{code1}</code>
                        </pre>
                      </div>
                      <div className="px-4 max-w-7xl mx-auto sm:px-6 lg:max-w-none lg:mx-0">
                        <h2 className="mt-4 mb-4 text-lg leading-6 font-medium text-gray-900">
                          Divider
                        </h2>
                        <pre className="text-xs w-full bg-gray-50 text-gray-600 p-2 rounded-lg">
                          <code>{code2}</code>
                        </pre>
                      </div>
                    </div>
                    <div className="px-4 w-full mx-auto lg:max-w-none lg:mx-0">
                      <h2 className="mt-4 mb-4 text-lg leading-6 font-medium text-gray-900">
                        Fragments
                      </h2>
                      <pre className="text-xs w-full bg-gray-50 text-gray-600 p-2 rounded-lg">
                        <code>{code3}</code>
                      </pre>
                    </div>
                    <div className="px-4 w-full mx-auto lg:max-w-none lg:mx-0">
                      <h2 className="mt-4 mb-4 text-lg leading-6 font-medium text-gray-900">
                        Messages
                      </h2>
                      <pre className="text-xs w-full bg-gray-50 text-gray-600 p-2 rounded-lg">
                        <code>{code4}</code>
                      </pre>
                    </div>
                  </div>
                  <div className="px-4 max-w-7xl mx-auto sm:px-6 lg:max-w-none lg:mx-0">
                    <h2 className="mt-8 mb-4 text-lg leading-6 font-medium text-gray-900">
                      Builtin Icons
                    </h2>
                    <p className="text-sm text-gray-500">
                      Use
                      <span className="rounded inline-block bg-gray-50 text-gray-600">
                        <code className="text-xs">@Actor TheParticipant</code>
                      </span>
                      to define the type of the participant.
                    </p>
                    <IconList types={standardTypes} />
                    <hr className="mt-4" />
                    <IconList types={awsServices} />
                    <hr className="mt-4" />
                    <IconList types={azureServices} />
                    <hr className="mt-4" />
                    <IconList types={googleServices} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
