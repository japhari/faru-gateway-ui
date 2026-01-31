export function EncryptionKeysModalCtrl($scope, $uibModalInstance, $timeout, Api, Notify, Alerting, encryptionKey) {
  /*********************************************************************/
  /**   These are the functions for the encryptionKey initial load     **/
  /*********************************************************************/

  // object to store temp values
  $scope.temp = {}
  $scope.temp.generateGovEsbKey = false
  $scope.temp.curve = 'prime256v1' // Default to P-256 (prime256v1) for GovESB
  $scope.generatingKeys = false

  // Available elliptic curves
  $scope.availableCurves = [
    { value: 'prime256v1', label: 'P-256 (prime256v1/secp256r1) - Recommended for GovESB' },
    { value: 'secp256k1', label: 'secp256k1 (Koblitz)' },
    { value: 'secp521r1', label: 'P-521 (secp521r1)' }
  ]

  // get/set the encryptionKey scope whether new or update
  if (encryptionKey) {
    $scope.update = true
    $scope.encryptionKey = Api.EncryptionKeys.get({ keyId: encryptionKey._id })
  } else {
    $scope.update = false
    $scope.encryptionKey = new Api.EncryptionKeys()
    // Prefill GovESB endpoints defaults
    $scope.encryptionKey.accessTokenUrl = 'https://esbdemo.gov.go.tz/gw/govesb-uaa/oauth/token'
    $scope.encryptionKey.pushRequestUrl = 'https://esbdemo.gov.go.tz/engine/esb/push-request'
    $scope.encryptionKey.responseRequestUrl = 'https://esbdemo.gov.go.tz/engine/esb/request'
    $scope.encryptionKey.asyncRequestUrl = 'https://esbdemo.gov.go.tz/engine/esb/async'
  }

  /*********************************************************************/
  /**   These are the functions for the encryptionKey initial load     **/
  /*********************************************************************/

  /********************************************************************/
  /**   These are the functions for the encryptionKey Modal Popup     **/
  /********************************************************************/

  const notifyEncryptionKey = function () {
    // reset backing object and refresh encryption keys list
    Notify.notify('encryptionKeyChanged')
    $uibModalInstance.close()
  }

  const success = function () {
    // add the success message
    Alerting.AlertAddMsg('top', 'success', 'The encryption key has been saved successfully')
    notifyEncryptionKey()
  }

  const error = function (err) {
    // add the error message
    Alerting.AlertAddMsg('top', 'danger', 'An error has occurred while saving the encryption key: #' + err.status + ' - ' + err.data)
    notifyEncryptionKey()
  }

  const saveEncryptionKey = function (encryptionKey) {
    if ($scope.update) {
      encryptionKey.$update(success, error)
    } else {
      encryptionKey.$save({}, success, error)
    }
  }

  /************************************************************/
  /**   These are the functions for the Encryption Key Modal  **/
  /************************************************************/

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel')
  }

  /************************************************************************/
  /**   Key Generation Functions                                         **/
  /************************************************************************/

  $scope.generateKeys = function () {
    $scope.generatingKeys = true
    Alerting.AlertReset()

    const generateParams = {
      curve: $scope.temp.curve || 'prime256v1', // Default to P-256 (prime256v1)
      generateGovEsbKey: $scope.temp.generateGovEsbKey || false
    }

    Api.EncryptionKeys.generate(
      generateParams,
      function (generatedKeys) {
        // Success - populate the form fields with generated keys
        $scope.encryptionKey.privateKey = generatedKeys.privateKey
        $scope.encryptionKey.publicKey = generatedKeys.publicKey
        $scope.encryptionKey.govesbPublicKey = generatedKeys.govesbPublicKey

        Alerting.AlertAddMsg('top', 'success', 'Encryption keys generated successfully')
        $scope.generatingKeys = false
      },
      function (err) {
        // Error
        Alerting.AlertAddMsg('top', 'danger', 'An error occurred while generating encryption keys: #' + err.status + ' - ' + err.data)
        $scope.generatingKeys = false
      }
    )
  }

  /************************************************************************/
  /**   Key Generation Functions                                         **/
  /************************************************************************/

  /************************************************************************/
  /**   These are the general functions for the form validation     **/
  /************************************************************************/

  $scope.validateFormEncryptionKeys = function () {
    // reset hasErrors alert object
    Alerting.AlertReset('hasErrors')

    // clear timeout if it has been set
    $timeout.cancel($scope.clearValidation)

    $scope.ngError = {}
    $scope.ngError.hasErrors = false

    // key name validation
    if (!$scope.encryptionKey.name || $scope.encryptionKey.name.trim() === '') {
      $scope.ngError.name = true
      $scope.ngError.hasErrors = true
    }

    // private key validation
    if (!$scope.encryptionKey.privateKey || $scope.encryptionKey.privateKey.trim() === '') {
      $scope.ngError.privateKey = true
      $scope.ngError.hasErrors = true
    }

    // public key validation
    if (!$scope.encryptionKey.publicKey || $scope.encryptionKey.publicKey.trim() === '') {
      $scope.ngError.publicKey = true
      $scope.ngError.hasErrors = true
    }

    // govesb public key validation
    if (!$scope.encryptionKey.govesbPublicKey || $scope.encryptionKey.govesbPublicKey.trim() === '') {
      $scope.ngError.govesbPublicKey = true
      $scope.ngError.hasErrors = true
    }

    if ($scope.ngError.hasErrors) {
      $scope.clearValidation = $timeout(function () {
        // clear errors after 5 seconds
        $scope.ngError = {}
      }, 5000)
      Alerting.AlertAddMsg('hasErrors', 'danger', $scope.validationFormErrorsMsg)
    }
  }

  $scope.submitFormEncryptionKeys = function () {
    // validate the form first to check for any errors
    $scope.validateFormEncryptionKeys()

    // save the encryption key object if no errors are present
    if ($scope.ngError.hasErrors === false) {
      saveEncryptionKey($scope.encryptionKey)
    }
  }

  /************************************************************************/
  /**   These are the general functions for the form validation     **/
  /************************************************************************/
}

