echo "Enter Pinpoint ApplicationID"
read applicationId
echo "Updating AWS Pinpoint with APNS Sandbox Channel"
aws pinpoint update-apns-sandbox-channel --application-id $applicationId --cli-input-json "file://$1" --region "us-west-2"
