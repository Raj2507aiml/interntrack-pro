/**
 * Smart URL parser to extract company name, role title, and website source from job links.
 * Works client-side without CORS restrictions by analyzing URL structure, path segments, and query parameters.
 */
export const parseJobUrl = (urlString) => {
  const result = {
    company: '',
    role: '',
    source: '',
  };

  if (!urlString) return result;

  try {
    // Add protocol if missing
    let formattedUrl = urlString.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const url = new URL(formattedUrl);
    const hostname = url.hostname.toLowerCase().replace('www.', '');
    result.source = hostname;

    // Helper: Capitalize and clean strings
    const cleanAndCapitalize = (str) => {
      if (!str) return '';
      return str
        .replace(/[_-]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\s+/g, ' ')   // Collapse multiple spaces
        .trim()
        .split(' ')
        .map(word => {
          if (word.length === 0) return '';
          // Capitalize first letter, keep rest as is but lowercase it unless it's an acronym like AI/CS/IT
          const upper = word.toUpperCase();
          if (['AI', 'CS', 'IT', 'SWE', 'UI', 'UX', 'QA', 'HR'].includes(upper)) {
            return upper;
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    };

    // Helper: Extract domain name (e.g., jobs.lever.co -> lever, careers.google.com -> google)
    const getDomainName = (host) => {
      const parts = host.split('.');
      if (parts.length >= 2) {
        // If it's something like company.myworkdayjobs.com, we want "company"
        if (host.includes('myworkdayjobs.com')) {
          return parts[0];
        }
        // General cases
        const mainDomain = parts[parts.length - 2];
        // If domain is "co" or "com" and there is a third segment (e.g. domain.co.uk)
        if (['com', 'co', 'org', 'net', 'edu', 'gov'].includes(mainDomain) && parts.length >= 3) {
          return parts[parts.length - 3];
        }
        return mainDomain;
      }
      return host;
    };

    // 1. LEVER (jobs.lever.co/company/jobId)
    if (hostname.includes('lever.co')) {
      result.source = 'Lever';
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        result.company = cleanAndCapitalize(pathSegments[0]);
      }
      // Lever URLs sometimes have the job title in query or as the second segment
      if (pathSegments.length > 1 && pathSegments[1] !== 'apply') {
        // Check if the second segment is a job ID (usually UUID-like or alphanumeric hash)
        // If it's a long hash, we might not get the role, but if it has words, we use it
        const possibleRole = pathSegments[1];
        if (possibleRole.length > 12 && !possibleRole.includes('-')) {
          result.role = ''; // Hash ID
        } else {
          result.role = cleanAndCapitalize(possibleRole);
        }
      }
    }
    
    // 2. GREENHOUSE (boards.greenhouse.io/company/jobs/jobId)
    else if (hostname.includes('greenhouse.io')) {
      result.source = 'Greenhouse';
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        // Handle greenhouse embeds
        if (pathSegments[0] === 'embed' && url.searchParams.has('board_id')) {
          result.company = cleanAndCapitalize(url.searchParams.get('board_id'));
        } else {
          result.company = cleanAndCapitalize(pathSegments[0]);
        }
      }
    }

    // 3. LINKEDIN (linkedin.com/jobs/view/jobId or linkedin.com/jobs/view/role-title-at-company-jobId)
    else if (hostname.includes('linkedin.com')) {
      result.source = 'LinkedIn';
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const viewIndex = pathSegments.indexOf('view');
      
      if (viewIndex !== -1 && pathSegments.length > viewIndex + 1) {
        const segment = pathSegments[viewIndex + 1];
        // LinkedIn often formats slugs as: software-engineer-intern-at-google-123456789
        if (segment.includes('-at-')) {
          const parts = segment.split('-at-');
          if (parts.length === 2) {
            const rolePart = parts[0];
            // Remove trailing numbers from company part (usually the job ID)
            const companyPart = parts[1].replace(/-\d+$/, '');
            result.role = cleanAndCapitalize(rolePart);
            result.company = cleanAndCapitalize(companyPart);
          }
        }
      }
    }

    // 4. INDEED (indeed.com/viewjob?jk=jobId or indeed.com/rc/clk?jk=...)
    else if (hostname.includes('indeed.com')) {
      result.source = 'Indeed';
      // Indeed usually doesn't have details in URL slug, but check query params
      const qVal = url.searchParams.get('q');
      if (qVal) {
        result.role = cleanAndCapitalize(qVal);
      }
    }

    // 5. GOOGLE CAREERS (careers.google.com/jobs/results/jobId-role-title)
    else if (hostname.includes('careers.google.com') || (hostname.includes('google.com') && url.pathname.includes('careers'))) {
      result.source = 'Google Careers';
      result.company = 'Google';
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const resultsIndex = pathSegments.indexOf('results');
      if (resultsIndex !== -1 && pathSegments.length > resultsIndex + 1) {
        const jobSlug = pathSegments[resultsIndex + 1];
        // e.g. 123456789-software-engineer-intern or software-engineer-intern
        const cleanedSlug = jobSlug.replace(/^\d+-/, ''); // Strip leading numbers
        result.role = cleanAndCapitalize(cleanedSlug);
      }
    }

    // 6. WORKDAY (company.myworkdayjobs.com/...)
    else if (hostname.includes('myworkdayjobs.com')) {
      result.source = 'Workday';
      result.company = cleanAndCapitalize(getDomainName(hostname));
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        // Workday roles often end in _JR-1234 or similar
        const rolePart = lastSegment.split('_')[0];
        if (rolePart && rolePart.toLowerCase() !== 'job') {
          result.role = cleanAndCapitalize(rolePart);
        }
      }
    }

    // 7. ZIPRECRUITER (ziprecruiter.com/jobs/company/role or c/company/jobs/role)
    else if (hostname.includes('ziprecruiter.com')) {
      result.source = 'ZipRecruiter';
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length >= 3) {
        // e.g. ziprecruiter.com/c/company-name/jobs/role-title-abc123
        if (pathSegments[0] === 'c') {
          result.company = cleanAndCapitalize(pathSegments[1]);
          const roleSlug = pathSegments[3] ? pathSegments[3].replace(/-[a-f0-9]+$/i, '') : '';
          result.role = cleanAndCapitalize(roleSlug);
        }
      } else if (pathSegments.length >= 2 && pathSegments[0] === 'jobs') {
        // ziprecruiter.com/jobs/company-name/role-title
        result.company = cleanAndCapitalize(pathSegments[1]);
        if (pathSegments[2]) {
          result.role = cleanAndCapitalize(pathSegments[2]);
        }
      }
    }

    // 8. GENERAL / FALLBACK
    else {
      // Extract company from domain
      const rawCompany = getDomainName(hostname);
      result.company = cleanAndCapitalize(rawCompany);
      result.source = cleanAndCapitalize(rawCompany);

      // Attempt to extract role from path if it looks like a job posting slug
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        // Filter out common job board keywords
        const jobKeywords = ['jobs', 'careers', 'career', 'job', 'position', 'posting', 'apply', 'details'];
        const potentialRoleSegments = pathSegments.filter(
          segment => !jobKeywords.includes(segment.toLowerCase()) && !/^\d+$/.test(segment) && segment.length > 3
        );
        
        if (potentialRoleSegments.length > 0) {
          // Use the last non-generic path segment as potential job title
          const roleSlug = potentialRoleSegments[potentialRoleSegments.length - 1];
          // Strip any trailing ID hashes if it looks like role-name-12345aef
          const cleanedRoleSlug = roleSlug.replace(/-[a-f0-9]{8,}$/i, '').replace(/-\d+$/, '');
          // Only use it if it's not too long or too short (typically a title is 2-5 words)
          const words = cleanedRoleSlug.split(/[_-]/);
          if (words.length >= 2 && words.length <= 8) {
            result.role = cleanAndCapitalize(cleanedRoleSlug);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error parsing URL:', error);
  }

  return result;
};
