# example usage 
# $ sh ./runall.sh "eslint ./ --fix"
# $ sh ./runall.sh "npm ci"
echo "************.    app-categories-service" 
cd ./app-categories-service && $1
echo "************.    app-service"
 cd ../app-service && $1
echo "************.    notify-service"
 cd ../notify-service && $1
echo "************.    event-service"
 cd ../event-service && $1
echo "************.    fiat-service"
 cd ../fiat-token-service && $1
echo "************.    file-service"
 cd ../file-service && $1
echo "************.    hash-service"
 cd ../hash-service && $1
echo "************.    kyc-service"
 cd ../kyc-service && $1
echo "************.    nft-collection-service"
 cd ../nft-collection-service && $1
echo "************.    nft-service"
 cd ../nft-service && $1
echo "************.    profile-service"
cd ../profile-service && $1
echo "************.    rest-service"
cd ../rest-service && $1
echo "************.    stack-service"
cd ../stack-service && $1
echo "************.    startup-service"
cd ../startup-service && $1
echo "************.    storage-service"
cd ../storage-service && $1
echo "************.    transaction-service"
cd ../transaction-post-processing-service && $1
echo "************.    transaction-service"
cd ../transaction-service && $1
echo "************.    user-service"
cd ../user-service && $1
echo "************.    wallet-service"
cd ../wallet-service && $1
