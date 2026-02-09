import { UnipileClient } from "unipile-node-sdk";

import { env } from "~/env";
import type { LinkedInEnrichmentRepository } from "../../LinkedInEnrichmentRepository";
import type { LinkedInEnrichmentResult } from "../../../objects";
import { LinkedInEnrichmentError } from "../../../objects";

function parseLinkedInUsername(linkedinUrl: string): string {
  const patterns = [
    /linkedin\.com\/in\/([^/?#]+)/i,
    /linkedin\.com\/pub\/([^/?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = linkedinUrl.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  throw new LinkedInEnrichmentError(
    "Please enter a valid LinkedIn profile URL",
    "INVALID_URL",
  );
}

function normalizeLinkedInUrl(username: string): string {
  return `https://www.linkedin.com/in/${username}`;
}

export class UnipileLinkedInRepository implements LinkedInEnrichmentRepository {
  private client: UnipileClient;
  private accountId: string;

  constructor() {
    const apiKey = env.UNIPILE_API_KEY;
    const dsnId = env.UNIPILE_DSN_ID;
    const accountId = env.UNIPILE_LINKEDIN_ACCOUNT_ID;

    if (!apiKey || !dsnId || !accountId) {
      throw new Error(
        "Unipile environment variables are not configured. Please set UNIPILE_API_KEY, UNIPILE_DSN_ID, and UNIPILE_LINKEDIN_ACCOUNT_ID.",
      );
    }

    this.client = new UnipileClient(`https://${dsnId}`, apiKey);
    this.accountId = accountId;
  }

  async fetchProfile(linkedinUrl: string): Promise<LinkedInEnrichmentResult> {
    const username = parseLinkedInUsername(linkedinUrl);

    try {
      const profileResponse = await this.client.users.getProfile({
        account_id: this.accountId,
        identifier: username,
        linkedin_sections: ["experience"],
      });

      const profile = profileResponse as {
        provider_id?: string;
        first_name?: string;
        last_name?: string;
        headline?: string;
        public_identifier?: string;
        work_experience?: Array<{
          position: string;
          company: string;
          company_id?: string;
          current?: boolean;
        }>;
      };

      if (!profile.provider_id) {
        throw new LinkedInEnrichmentError(
          "Unable to fetch profile. The profile may be private.",
          "PRIVATE_PROFILE",
        );
      }

      const currentPosition =
        profile.work_experience?.find(
          (experience) => experience.current === true,
        ) ?? profile.work_experience?.[0];
      let companyData = null;

      if (currentPosition?.company) {
        try {
          const companyResponse = await this.client.users.getCompanyProfile({
            account_id: this.accountId,
            identifier: currentPosition.company,
          });

          const company = companyResponse as {
            id?: string;
            name?: string;
            industry?: string[];
            employee_count?: number;
            website?: string;
            public_identifier?: string;
          };

          companyData = {
            providerId: company.id ?? null,
            name: company.name ?? currentPosition.company,
            industry: company.industry?.[0] ?? null,
            size:
              company.employee_count != null
                ? String(company.employee_count)
                : null,
            website: company.website ?? null,
            linkedinUrl: company.public_identifier
              ? `https://www.linkedin.com/company/${company.public_identifier}`
              : null,
          };
        } catch {
          companyData = {
            providerId: null,
            name: currentPosition.company,
            industry: null,
            size: null,
            website: null,
            linkedinUrl: null,
          };
        }
      }

      return {
        profile: {
          providerId: profile.provider_id,
          firstName: profile.first_name ?? "",
          lastName: profile.last_name ?? "",
          headline: profile.headline ?? null,
          linkedinUrl: normalizeLinkedInUrl(
            profile.public_identifier ?? username,
          ),
          currentJobTitle:
            currentPosition?.position ?? profile.headline ?? null,
        },
        company: companyData,
      };
    } catch (error) {
      if (error instanceof LinkedInEnrichmentError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("404")
      ) {
        throw new LinkedInEnrichmentError(
          "Profile not found. Please check the LinkedIn URL.",
          "PROFILE_NOT_FOUND",
        );
      }

      throw new LinkedInEnrichmentError(
        "Unable to fetch LinkedIn data. Please try again.",
        "API_ERROR",
      );
    }
  }
}
