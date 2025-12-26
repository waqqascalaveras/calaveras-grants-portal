# Production Deployment Checklist
## Calaveras County Grants Portal

Use this checklist to ensure all requirements are met before deploying to production.

---

## Pre-Deployment (2 weeks before launch)

### Environment Setup
- [ ] Production server provisioned and accessible
- [ ] DNS records configured (grants.co.calaveras.ca.us)
- [ ] SSL/TLS certificate obtained and installed
- [ ] Firewall rules configured (allow ports 80, 443)
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured (uptime, performance)
- [ ] Log aggregation system set up

### Code Repository
- [ ] Git repository created and accessible to team
- [ ] Branch protection rules enabled on `main` branch
- [ ] `.gitignore` properly configured
- [ ] README.md updated with accurate information
- [ ] All sensitive files excluded (.env, credentials)
- [ ] Code review process established
- [ ] CI/CD pipeline configured and tested

### Environment Variables
- [ ] `.env.production` file created
- [ ] `REACT_APP_API_BASE_URL` set correctly
- [ ] `REACT_APP_RESOURCE_ID` verified
- [ ] `REACT_APP_CACHE_DURATION` configured (43200000 = 12 hours)
- [ ] `REACT_APP_COUNTY_NAME` set to "Calaveras County"
- [ ] Environment variables secured (not in version control)
- [ ] Backup of environment variables stored securely

### Dependencies & Security
- [ ] All npm packages updated to latest stable versions
- [ ] `npm audit` run with no high/critical vulnerabilities
- [ ] Security scan completed (Snyk or similar)
- [ ] Third-party library licenses reviewed
- [ ] OWASP security checklist reviewed
- [ ] Dependency versions locked in package-lock.json

---

## Testing Phase (1 week before launch)

### Functional Testing
- [ ] All department filters tested
- [ ] Search functionality verified
- [ ] Grant card display correct for all statuses
- [ ] External links open correctly
- [ ] Cache system working (12-hour TTL)
- [ ] Manual cache clear tested
- [ ] Error handling verified (API down, network error)
- [ ] Edge cases tested (no results, malformed data)

### Browser Testing
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Testing
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing (NVDA or JAWS)
- [ ] Keyboard navigation tested
- [ ] Color contrast ratios checked
- [ ] Alt text added for all images
- [ ] ARIA labels added where needed
- [ ] Focus indicators visible

### Performance Testing
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Load tested with 100 concurrent users
- [ ] API rate limiting tested
- [ ] Cache performance verified

### Security Testing
- [ ] XSS vulnerability scan completed
- [ ] CSRF protection verified
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Content Security Policy implemented
- [ ] No sensitive data exposed in client
- [ ] Input validation tested
- [ ] SQL injection prevention verified (if applicable)

### User Acceptance Testing
- [ ] Public Health staff tested and approved
- [ ] Social Services staff tested and approved
- [ ] IT Department tested and approved
- [ ] County Administrator's Office reviewed
- [ ] Feedback collected and addressed
- [ ] Training materials prepared
- [ ] User guide finalized

---

## Deployment Day

### Pre-Deployment (Morning)
- [ ] Team meeting scheduled
- [ ] Deployment window communicated (maintenance notice)
- [ ] Rollback plan documented and tested
- [ ] Stakeholders notified of deployment
- [ ] Support team on standby
- [ ] Backup of current production (if upgrading)

### Build Process
- [ ] Latest code pulled from `main` branch
- [ ] Dependencies installed: `npm ci`
- [ ] Tests passing: `npm test`
- [ ] Production build created: `npm run build`
- [ ] Build artifacts verified (no errors)
- [ ] Build size acceptable (< 5MB)
- [ ] Source maps generated

### Deployment Steps
- [ ] Production build deployed to server
- [ ] Web server configuration verified
- [ ] SSL certificate validated
- [ ] DNS propagation confirmed
- [ ] Cache headers configured correctly
- [ ] Gzip compression enabled
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured (if applicable)

### Post-Deployment Verification (within 30 minutes)
- [ ] Application loads successfully
- [ ] No JavaScript errors in console
- [ ] API connectivity verified
- [ ] All links working
- [ ] Forms submitting correctly
- [ ] Mobile view displays correctly
- [ ] Performance metrics acceptable
- [ ] SSL certificate valid and working
- [ ] Monitoring alerts configured
- [ ] Health check endpoint responding
- [ ] Log files being written correctly

### Smoke Testing (within 1 hour)
- [ ] Search for "public health" grants - results appear
- [ ] Select different departments - filters work
- [ ] Click on grant details - opens correctly
- [ ] Check recently closed grants - appear dimmed
- [ ] Verify cache - data loads quickly on refresh
- [ ] Test from different network locations
- [ ] Test on County internal network
- [ ] Test from external network

---

## Post-Deployment (First Week)

### Day 1
- [ ] Monitor error logs (check every 2 hours)
- [ ] Monitor performance metrics
- [ ] Verify analytics tracking working
- [ ] Check cache hit rate
- [ ] Respond to user feedback
- [ ] Document any issues encountered
- [ ] Send success notification to stakeholders

### Day 2-3
- [ ] Review analytics data
- [ ] Monitor user behavior patterns
- [ ] Check for any error spikes
- [ ] Verify API rate limits not exceeded
- [ ] Collect user feedback
- [ ] Address any minor issues

### Day 4-7
- [ ] Conduct team retrospective
- [ ] Document lessons learned
- [ ] Update documentation with any changes
- [ ] Plan for next iteration improvements
- [ ] Schedule training sessions for departments
- [ ] Create support knowledge base articles

---

## Ongoing Maintenance

### Daily
- [ ] Check application uptime
- [ ] Review error logs
- [ ] Monitor API connectivity
- [ ] Check cache performance

### Weekly
- [ ] Review analytics dashboard
- [ ] Check for new grants posted
- [ ] Monitor user feedback channels
- [ ] Verify backup systems working
- [ ] Review security alerts

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review and update department keywords
- [ ] Analyze grant discovery success rate
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Team meeting to discuss improvements

### Quarterly
- [ ] Major dependency updates
- [ ] Security penetration testing
- [ ] User satisfaction survey
- [ ] Feature enhancement planning
- [ ] Disaster recovery drill
- [ ] Accessibility audit
- [ ] Performance optimization review

---

## Emergency Rollback Procedure

If critical issues are discovered post-deployment:

1. **Immediate Actions (within 5 minutes)**
   - [ ] Alert team of issue
   - [ ] Take screenshot/documentation of issue
   - [ ] Check if issue is client-side or server-side

2. **Rollback Decision (within 15 minutes)**
   - [ ] Assess severity (critical/major/minor)
   - [ ] Determine if rollback needed
   - [ ] Get approval from project lead

3. **Execute Rollback (within 30 minutes)**
   - [ ] Restore previous build from backup
   - [ ] Verify rollback successful
   - [ ] Test critical functionality
   - [ ] Notify stakeholders of rollback
   - [ ] Update status page

4. **Post-Rollback**
   - [ ] Document root cause
   - [ ] Create fix in development environment
   - [ ] Test fix thoroughly
   - [ ] Schedule re-deployment
   - [ ] Update team on lessons learned

---

## Success Criteria

The deployment is considered successful when:

- [ ] Application loads in < 3 seconds
- [ ] No critical errors in logs
- [ ] All user acceptance tests passing
- [ ] 95%+ uptime in first 24 hours
- [ ] Positive feedback from at least 3 departments
- [ ] No security vulnerabilities identified
- [ ] Cache system reducing API calls by 80%+
- [ ] Grant discovery working for all departments

---

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** ___________________ 

**Verified By:**

- [ ] Development Lead: ___________________
- [ ] IT Manager: ___________________
- [ ] Security Officer: ___________________
- [ ] Public Health Director: ___________________
- [ ] County IT Director: ___________________

**Notes:**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

---

## Contact Information

**Emergency Contacts:**
- Development Team Lead: [Name] - [Phone] - [Email]
- IT Operations: [Name] - [Phone] - [Email]
- Project Sponsor: Waqqas - [Phone] - [Email]
- After-Hours Support: [Phone]

**Escalation Path:**
1. Development Team (0-30 min)
2. IT Manager (30-60 min)
3. IT Director (60+ min)

---

*This checklist should be completed and signed before deploying to production.*
*Keep a copy for audit and compliance purposes.*
