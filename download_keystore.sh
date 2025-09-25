#!/bin/bash

echo "Downloading keystore from EAS..."
echo ""
echo "Please follow these steps manually:"
echo "1. Run: npx eas credentials -p android"
echo "2. Choose: Keystore: Manage everything needed to build your project"
echo "3. Choose: Download existing"
echo "4. Save the keystore as: android/app/@irim__resetPulse.jks"
echo ""
echo "Expected SHA1: DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58"
echo ""
echo "After downloading, verify with:"
echo "keytool -list -v -keystore android/app/@irim__resetPulse.jks"