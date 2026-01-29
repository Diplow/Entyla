import { ContactService as _ContactService } from "./prospect";
import { IamService as _IamService } from "./iam";
import { withLogging } from "~/lib/logging";

export const ContactService = withLogging("ContactService", _ContactService);
export const IamService = withLogging("IamService", _IamService);
