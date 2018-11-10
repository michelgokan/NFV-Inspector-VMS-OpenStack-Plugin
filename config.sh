#!/bin/bash

PLUGIN_NAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd | xargs basename | awk '{print tolower($0)}' )"

echo "Checking for existing configuration..."
EXISTS=$( curl -X GET --header 'Accept: application/json' "http://127.0.0.1:3000/api/configurations/count?where=%7B%22category%22%3A%22$PLUGIN_NAME%22%7D" | jq ".count" )

if [ "$EXISTS" -eq "0" ]; then
  echo "No previous configuration exists..."
else
  echo "Configuration already exists..."
  echo "Please try reinstalling NFV-VMS!"
  echo "Exiting installation!"
  exit 0
fi

if ! $(command_exists openstack); then
    echo 'openstack client does not installed' >&2

    echo "Attempting to install OpenStack Python client. May ask for sudo password."
    echo "sudo add-apt-repository cloud-archive:pike"
    sudo add-apt-repository cloud-archive:pike
    echo "sudo apt update && apt dist-upgrade"
    sudo apt update && apt dist-upgrade
    echo "sudo apt install -y python-openstackclient software-properties-common chrony curl thin-provisioning-tools python-software-propertie"
    sudo apt install -y python-openstackclient software-properties-common chrony curl thin-provisioning-tools python-software-propertie
fi

echo "Please enter OpenStack AUTH_URL address (HINT: normally http://{controller node IP}:35357/v3):"
read -r openstack_api_address

echo "Please enter OpenStack username (admin):"
read -r openstack_username

echo "Please enter OpenStack password:"
read -r openstack_password

echo "Please enter OpenStack project name (i.e admin):"
read -r openstack_project_name

echo "Please enter OpenStack project domain name (default):"
read -r openstack_project_domain_name

echo "Please enter OpenStack user domain name (default):"
read -r openstack_user_domain_name

echo "Please enter OpenStack volume API version (2):"
read -r openstack_user_volume_api_version

echo "Please enter OpenStack identity API version (3):"
read -r openstack_user_identity_api_version

con=''

if [ -f ./openstack_fulladmin ]; then
    echo "An OpenStack configuration already exists:"
    cat ./openstack_fulladmin
    echo "Do you want to overwrite above configs (y/N): "
    read -r con
else
    con="y"
fi

if [ $con == 'y' ] || [ $con == 'Y' ]; then
    echo "Creating KeyStone configuration under ./openstack_fulladmin (may ask for root password)"

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

   echo "A new OpenStack configuration has been created:"
   cat ./openstack_fulladmin
fi

echo "Attempting to connect to OpenStack API server and getting list of nodes..."
source ./openstack_fulladmin
openstack host list

if [ $? -eq 0 ]; then
    echo "Successfully connected to OpenStack!"
    echo "Saving plugin configs..."

    curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_username\", \"value\": \"$openstack_username\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_password\", \"value\": \"$openstack_password\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_project_name\", \"value\": \"$openstack_project_name\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_api_address\", \"value\": \"$openstack_api_address\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_user_volume_api_version\", \"value\": \"$openstack_user_volume_api_version\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_user_identity_api_version\", \"value\": \"$openstack_user_identity_api_version\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_project_domain_name\", \"value\": \"$openstack_project_domain_name\" }" \
     'http://127.0.0.1:3000/api/configurations'

     curl -X POST --header 'Content-Type: application/json' --header \
     'Accept: application/json' -d \
     "{ \"category\": \"${PLUGIN_NAME}\", \"key\": \"openstack_user_domain_name\", \"value\": \"$openstack_user_domain_name\" }" \
     'http://127.0.0.1:3000/api/configurations'
else
    echo "Can't connect to OpenStack with provided information!"
    echo "Exiting application!"
    exit 0
fi