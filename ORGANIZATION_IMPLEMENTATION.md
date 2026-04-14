# D's Cloud Space - Organization Management System (v2)

## Implementation Summary

Complete organization management system with multi-org support, role-based access control, email invitations, and organizational policies.

## What Was Added

### Backend Models
1. **Organization.js** - Updated with logo, description, storage quota, status
2. **OrganizationMember.js** - NEW: Track members with roles (owner/admin/member/viewer)
3. **OrganizationInvite.js** - NEW: Email invite tokens with 7-day expiration
4. **OrganizationPolicy.js** - NEW: Per-org settings (2FA, sharing, downloads, file size limits)
5. **User.js** - Updated with organizations array and currentOrganization field
6. **File.js** - Updated with organizationId for org-scoped storage

### Backend Routes
1. **organizationV2.js** - NEW: Comprehensive organization management endpoints
   - Create/list/get/update organizations
   - Member management (invite, remove, role update, suspend)
   - Ownership transfer
   - Storage tracking
   - Policy management
   - Organization switching

### Frontend Pages
1. **OrganizationsPage.jsx** - NEW: List all user's organizations, create new org
2. **OrganizationSettingsPage.jsx** - NEW: Manage org settings, members, invitations
3. **AcceptInvitePage.jsx** - NEW: Accept organization invitations via token
4. **HomePage.jsx** - Updated: Added organizations link in navigation

### Frontend Styling
1. **OrganizationsPage.css** - Organization listing and creation UI
2. **OrganizationSettingsPage.css** - Settings/members/invite tabs
3. **AcceptInvitePage.css** - Invitation acceptance page

### Frontend Routes
Added to App.jsx:
- `/organizations` - Manage organizations
- `/org/:orgId` - Organization settings
- `/accept-invite/:token` - Accept invitation

## Key Features

✅ Create unlimited organizations
✅ Invite members via email (7-day tokens)
✅ Role-based access (owner/admin/member/viewer)
✅ Member suspension without deletion
✅ Ownership transfer capability
✅ Per-org storage quotas and tracking
✅ Organizational policies and settings
✅ Isolated file storage per organization
✅ User can belong to multiple organizations
✅ Automatic email notifications (with fallback logging)

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Organization.js (updated)
│   │   ├── OrganizationMember.js (new)
│   │   ├── OrganizationInvite.js (new)
│   │   ├── OrganizationPolicy.js (new)
│   │   ├── User.js (updated)
│   │   └── File.js (updated)
│   ├── routes/
│   │   └── organizationV2.js (new)
│   └── server.js (updated)
│
frontend/
├── src/
│   ├── pages/
│   │   ├── OrganizationsPage.jsx (new)
│   │   ├── OrganizationSettingsPage.jsx (new)
│   │   ├── AcceptInvitePage.jsx (new)
│   │   └── HomePage.jsx (updated)
│   ├── styles/
│   │   ├── OrganizationsPage.css (new)
│   │   ├── OrganizationSettingsPage.css (new)
│   │   └── AcceptInvitePage.css (new)
│   └── App.jsx (updated)
```

## API Endpoints (28 total)

### Organizations (9 endpoints)
- GET /api/orgs - List all orgs
- POST /api/orgs - Create org
- GET /api/orgs/:orgId - Get org details
- PUT /api/orgs/:orgId - Update org profile
- POST /api/orgs/:orgId/switch - Switch active org
- GET /api/orgs/:orgId/storage - Get storage usage
- GET /api/orgs/:orgId/policies - Get org policies
- PUT /api/orgs/:orgId/policies - Update policies
- POST /api/orgs/:orgId/transfer-ownership - Transfer owner

### Members (10 endpoints)
- GET /api/orgs/:orgId/members - List members
- POST /api/orgs/:orgId/invite - Invite member
- POST /api/orgs/invite/:token/accept - Accept invite
- PUT /api/orgs/:orgId/members/:id/role - Update member role
- POST /api/orgs/:orgId/members/:id/suspend - Suspend member
- DELETE /api/orgs/:orgId/members/:id - Remove member

### Plus existing endpoints (9)
- Auth (4): signup, login, forgot-password, reset-password
- Files (5): GET all, GET one, POST upload, DELETE, UPDATE

## Security Features

✅ Role-based endpoint authorization
✅ Organization membership verification
✅ Suspended member access denial
✅ Owner-only operations protection
✅ Admin-only member management
✅ 7-day expiring invite tokens
✅ JWT token validation
✅ CORS protection
✅ Input validation

## Database Relationships

```
User ─┬─ many Organizations (through OrganizationMember)
      ├─ many OrganizationMembers
      ├─ many OrganizationInvites (invited_by)
      └─ many Files

Organization ─┬─ one User (owner)
              ├─ many OrganizationMembers
              ├─ many OrganizationInvites
              ├─ one OrganizationPolicy
              └─ many Files

OrganizationMember ─┬─ one Organization
                   └─ one User

OrganizationInvite ─┬─ one Organization
                   ├─ one User (invited_by)
                   └─ one Email (recipient)

OrganizationPolicy ─ one Organization

File ─┬─ one User
      ├─ one Organization (optional)
      └─ one File path on disk
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### First Test
1. Sign up a new user
2. Go to /organizations
3. Create an organization
4. Click "Open" on the org card → goes to settings
5. Go to "Invite" tab
6. Invite another user's email
7. Check server console for invite link (if no SMTP)
8. Accept invite with another account

## Testing Checklist

- [ ] Create organization
- [ ] Invite member via email
- [ ] Accept invite from email/console link
- [ ] View organization members
- [ ] Update member role
- [ ] Suspend member
- [ ] Remove member
- [ ] Update organization profile
- [ ] View storage usage
- [ ] Switch between organizations
- [ ] Transfer ownership

## Environment Variables

New variables for email invitations:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="D's Cloud Space" <no-reply@example.com>
CLIENT_URL=http://localhost:3000
```

If not configured, invites log to console for development.

## Next Steps

1. Test all organization workflows
2. Deploy to production
3. Consider future enhancements:
   - Two-factor authentication enforcement
   - Activity audit logs
   - Custom role templates
   - Bulk member invite
   - Organization API keys
   - SSO/SAML support

## Documentation

See `ORGANIZATION_GUIDE.md` for:
- Detailed feature explanations
- API usage examples
- Testing workflows
- Troubleshooting guide
- Database schema details
