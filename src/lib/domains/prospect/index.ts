import {
  ContactService as _ContactService,
  createCompanyService,
} from "./services";
import { DrizzleCompanyRepository } from "./repositories";
import {
  LinkedInEnrichmentService as _LinkedInEnrichmentService,
  LinkedInEnrichmentError,
} from "./linkedin-enrichment";
import { withLogging } from "~/lib/logging";

export const ContactService = withLogging("ContactService", _ContactService);

const companyRepository = new DrizzleCompanyRepository();
export const CompanyService = withLogging(
  "CompanyService",
  createCompanyService(companyRepository),
);

export const LinkedInEnrichmentService = withLogging(
  "LinkedInEnrichmentService",
  _LinkedInEnrichmentService,
);

export { LinkedInEnrichmentError };

export type {
  LinkedInProfileData,
  LinkedInCompanyData,
  LinkedInEnrichmentResult,
} from "./linkedin-enrichment";
