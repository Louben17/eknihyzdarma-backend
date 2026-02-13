/**
 * Set public permissions for Strapi content types
 * Usage: STRAPI_URL=... STRAPI_TOKEN=... node scripts/set-permissions.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';
const TOKEN = process.env.STRAPI_TOKEN;

if (!TOKEN) {
  console.error('STRAPI_TOKEN is required');
  process.exit(1);
}

async function setPermissions() {
  const headers = { 'Authorization': `Bearer ${TOKEN}` };

  // Get roles
  const rolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, { headers });
  const roles = await rolesRes.json();
  console.log('Roles:', roles.roles?.map(r => `${r.name} (${r.type}, id:${r.id})`));

  const publicRole = roles.roles?.find(r => r.type === 'public');
  if (!publicRole) {
    console.log('Public role not found!');
    return;
  }

  // Get full role details
  const roleRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, { headers });
  const roleData = await roleRes.json();
  const permissions = roleData.role.permissions;

  console.log('API permissions found:', Object.keys(permissions).filter(k => k.startsWith('api::')));

  // Enable find and findOne for book, author, category
  const apisToEnable = ['api::book', 'api::author', 'api::category', 'api::banner'];
  for (const api of apisToEnable) {
    if (permissions[api]) {
      const controllers = permissions[api].controllers;
      for (const ctrl in controllers) {
        if (controllers[ctrl].find) {
          controllers[ctrl].find.enabled = true;
          console.log(`  Enabled ${api} ${ctrl}.find`);
        }
        if (controllers[ctrl].findOne) {
          controllers[ctrl].findOne.enabled = true;
          console.log(`  Enabled ${api} ${ctrl}.findOne`);
        }
      }
    } else {
      console.log(`  WARNING: ${api} not found in permissions`);
    }
  }

  // Update the role
  const updateRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permissions })
  });

  if (updateRes.ok) {
    console.log('\nPublic permissions updated successfully!');
  } else {
    const err = await updateRes.text();
    console.log(`\nFailed: ${updateRes.status} ${err}`);
  }
}

setPermissions().catch(console.error);
