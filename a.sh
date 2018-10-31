#!/bin/bash

sudo cat >openstack_fulladmin <<EOL
export OS_USERNAME=${openstack_username}
export OS_PASSWORD=${openstack_password}
export OS_PROJECT_NAME=${openstack_project_name}
export OS_AUTH_URL=${openstack_api_address}
export OS_VOLUME_API_VERSION=${openstack_user_volume_api_version}
export OS_IDENTITY_API_VERSION=${openstack_user_identity_api_version}
export OS_PROJECT_DOMAIN_NAME=${openstack_project_domain_name}
export OS_USER_DOMAIN_NAME=${openstack_user_domain_name}
EOL
