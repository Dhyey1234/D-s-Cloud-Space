# Organization Management - Testing & Implementation Guide

## Overview
This guide explains the comprehensive organization management system implemented in D's Cloud Space v2.

## Key Features Implemented

### 1. Multi-Organization Support
- Users can create and manage multiple organizations
- Switch between organizations instantly
- Each organization is completely isolated (storage, members, settings)

### 2. Role-Based Access Control (RBAC)
Four-tier role system:
- **Owner**: Can transfer ownership, edit settings, manage all members
- **Admin**: Can invite members, edit settings, manage non-owner members
- **Member**: Can upload/download files but cannot manage other members
- **Viewer**: Read-only access to organizational files

### 3. Email-Based Member Invitations
- Invite members by email address
- 7-day expiration link
- Automatic logging to console if SMTP not configured
- Accept invitation via `/accept-invite/:token` route
- Role assignment at invite time

### 4. Organization Policies
Per-organization settings:
- Two-factor authentication requirement
- Public sharing permissions
- Download restrictions
- Max file size enforcement
- Storage quota (default 1GB, customizable)

### 5. Member Suspension
- Suspend members without deletion
- Users cannot access org while suspended
- Data retained for potential restoration
- Admins can remove if needed

### 6. Ownership Transfer
- Current owner transfers to any member
- Original owner becomes admin
- Single owner per organization
- Cannot transfer to non-members

## Database Models

### Organization
```javascript
{
  name: String,
  description: String,
  logo: String (URL),
  owner: UserId,
  storageQuota: Number (bytes),
  storageUsed: Number (bytes),
  status: 'active' | 'suspended',
  timestamps
}
```

### OrganizationMember
```javascript
{
  organization: OrgId,
  user: UserId,
  role: 'owner' | 'admin' | 'member' | 'viewer',
  status: 'active' | 'suspended' | 'invited',
  joinedAt: Date,
  timestamps
}
```

### OrganizationInvite
```javascript
{
  organization: OrgId,
  email: String,
  role: 'admin' | 'member' | 'viewer',
  invitedBy: UserId,
  token: String (unique),
  expiresAt: Date,
  status: 'pending' | 'accepted' | 'rejected',
  timestamps
}
```

### OrganizationPolicy
```javascript
{
  organization: OrgId,
  twoFactorRequired: Boolean,
  allowPublicSharing: Boolean,
  allowDownloads: Boolean,
  maxFileSize: Number (bytes),
  timestamps
}
```

## Frontend Components

### 1. OrganizationsPage (`/organizations`)
- View all user's organizations
- Create new organization
- Quick view of member count and role
- Click to open org settings

### 2. OrganizationSettingsPage (`/org/:orgId`)
- **Profile Tab**: Edit org name, description, logo
- **Members Tab**: View members, roles, suspend/remove
- **Invite Tab**: Send new member invitations

### 3. AcceptInvitePage (`/accept-invite/:token`)
- Accept pending organization invitation
- Link from email invitation
- Adds user to organization with specified role

### 4. HomePage Updates
- "Organizations" button in navigation
- Quick org switcher (future enhancement)
- File management scoped to current org

## API Usage Examples

### Create Organization
```bash
curl -X POST http://localhost:8000/api/orgs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "description": "Company cloud storage"
  }'
```

### Invite Member
```bash
curl -X POST http://localhost:8000/api/orgs/ORG_ID/invite \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "member"
  }'
```

### Get Organization Members
```bash
curl -X GET http://localhost:8000/api/orgs/ORG_ID/members \
  -H "Authorization: Bearer TOKEN"
```

### Update Member Role
```bash
curl -X PUT http://localhost:8000/api/orgs/ORG_ID/members/MEMBER_ID/role \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Transfer Ownership
```bash
curl -X POST http://localhost:8000/api/orgs/ORG_ID/transfer-ownership \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newOwnerId": "NEW_OWNER_USER_ID"}'
```

## Testing Workflow

### Step 1: Create Organization
1. Go to `/organizations`
2. Click "+ Create Organization"
3. Enter name and optional description
4. Submit form

### Step 2: Invite Members
1. Go to org settings (click "Open" on org card)
2. Click "Invite" tab
3. Enter email and select role
4. Send invite

### Step 3: Accept Invitation (as invitee)
1. Check console logs for email URL (if no SMTP)
2. Or check real email if SMTP configured
3. Click accept-invite link
4. Should see "Invite accepted!" message
5. Can now access organization

### Step 4: Manage Members
1. Go to org settings → Members tab
2. View all members and their roles
3. Click "Remove" to remove member
4. Member loses access immediately

### Step 5: Suspend Member (if needed)
1. Go to org settings → Members tab
2. Click suspend button on member
3. Member cannot access org (but data retained)

### Step 6: Update Organization Profile
1. Go to org settings → Profile tab
2. Update name/description
3. Click "Save Changes"

### Step 7: Transfer Ownership
1. From org settings, click on member
2. Promote to Owner
3. Old owner becomes Admin
4. New owner has full control

## Environment Setup

### Required Backend Environment Variables
```env
# Email Configuration (for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="D's Cloud Space" <no-reply@example.com>
CLIENT_URL=http://localhost:3000
```

### Without SMTP (Development)
- Invitations logged to server console
- Copy URL from logs to test acceptance
- Perfect for local testing

## Security Considerations

1. **Role Validation**: All endpoints check user role before allowing actions
2. **Organization Isolation**: Users can only access orgs they're members of
3. **Data Privacy**: Files/members isolated per organization
4. **Token Expiration**: Invite tokens expire in 7 days
5. **Suspension**: Suspended members cannot access resources but data preserved

## Future Enhancements

1. **2FA Support**: Implement two-factor authentication enforcing
2. **Activity Logging**: Track all member and file actions
3. **Bulk Invite**: Invite multiple users at once
4. **Custom Roles**: Allow creating custom role templates
5. **Resource Sharing**: Share files across organizations
6. **Audit Trail**: Full access history per organization
7. **API Keys**: Organization-level API access tokens
8. **SSO Integration**: SAML/OAuth for enterprise orgs

## Troubleshooting

### Invites Not Sending?
- Check `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` in `.env`
- If not configured, check server console for logged URLs
- Gmail: Use "App Password" not regular password

### Can't Access Organization?
- Verify user is in org members list
- Check member status (active/suspended)
- User must be logged in with correct token

### Member Removal Failed?
- Cannot remove organization owner
- Admin can only remove non-owner members
- Try refreshing page and retry

## API Endpoint Summary

| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| /api/orgs | GET | ✅ | - |
| /api/orgs | POST | ✅ | - |
| /api/orgs/:orgId | GET | ✅ | member+ |
| /api/orgs/:orgId | PUT | ✅ | admin+ |
| /api/orgs/:orgId/members | GET | ✅ | member+ |
| /api/orgs/:orgId/invite | POST | ✅ | admin+ |
| /api/orgs/invite/:token/accept | POST | ✅ | - |
| /api/orgs/:orgId/members/:id/role | PUT | ✅ | admin+ |
| /api/orgs/:orgId/members/:id/suspend | POST | ✅ | admin+ |
| /api/orgs/:orgId/members/:id | DELETE | ✅ | admin+ |
| /api/orgs/:orgId/transfer-ownership | POST | ✅ | owner |
| /api/orgs/:orgId/storage | GET | ✅ | member+ |
| /api/orgs/:orgId/policies | GET | ✅ | member+ |
| /api/orgs/:orgId/policies | PUT | ✅ | admin+ |
