import encryptionKeysModal from "~/views/encryptionKeysModal";
import confirmModal from "~/views/confirmModal";
import { EncryptionKeysModalCtrl, ConfirmModalCtrl } from "./";

export function EncryptionKeysCtrl($scope, $uibModal, Api, Alerting) {
  /************************************************/
  /**         Initial load & onChanged           **/
  /************************************************/
  const querySuccess = function (encryptionKeys) {
    $scope.encryptionKeys = encryptionKeys;
    if (encryptionKeys.length === 0) {
      Alerting.AlertAddMsg(
        "bottom",
        "warning",
        "There are currently no encryption keys created"
      );
    }
  };

  const queryError = function (err) {
    // on error - add server error alert
    Alerting.AlertAddServerMsg(err.status);
  };

  // do the initial request
  Api.EncryptionKeys.query(querySuccess, queryError);

  $scope.$on("encryptionKeyChanged", function () {
    Api.EncryptionKeys.query(querySuccess, queryError);
  });
  /************************************************/
  /**         Initial load & onChanged           **/
  /************************************************/

  /**********************************************************/
  /**         Add/edit encryptionKeys popup modal           **/
  /**********************************************************/
  $scope.addEncryptionKey = function () {
    Alerting.AlertReset();
    $uibModal.open({
      template: encryptionKeysModal,
      controller: EncryptionKeysModalCtrl,
      resolve: {
        encryptionKey: function () {},
      },
    });
  };

  $scope.editEncryptionKey = function (encryptionKey) {
    Alerting.AlertReset();

    $uibModal.open({
      template: encryptionKeysModal,
      controller: EncryptionKeysModalCtrl,
      resolve: {
        encryptionKey: function () {
          return encryptionKey;
        },
      },
    });
  };
  /**********************************************************/
  /**         Add/edit encryptionKeys popup modal           **/
  /**********************************************************/

  /*******************************************/
  /**         Delete Confirmation           **/
  /*******************************************/
  const deleteSuccess = function () {
    // On success
    $scope.encryptionKeys = Api.EncryptionKeys.query();
    Alerting.AlertAddMsg(
      "top",
      "success",
      "The encryption key has been deleted successfully"
    );
  };

  const deleteError = function (err) {
    if (err.status === 409) {
      let warningMessage =
        "Could not delete the encryption key because it is associated with the following resources: ";
      if (err.data && err.data.length > 0) {
        for (let i = 0; i < err.data.length; i++) {
          if (i > 0) {
            warningMessage += ", ";
          }
          warningMessage += err.data[i].name;
        }
      } else {
        warningMessage =
          "Could not delete the encryption key because it is currently in use";
      }
      Alerting.AlertAddMsg("top", "warning", warningMessage);
    } else {
      // add the error message
      Alerting.AlertAddMsg(
        "top",
        "danger",
        "An error has occurred while deleting the encryption key: #" +
          err.status +
          " - " +
          err.data
      );
    }
  };

  $scope.confirmDelete = function (encryptionKey) {
    Alerting.AlertReset();

    const deleteObject = {
      title: "Delete Encryption Key",
      button: "Delete",
      message:
        'Are you sure you wish to delete the encryption key "' +
        encryptionKey.name +
        '"?',
    };

    const modalInstance = $uibModal.open({
      template: confirmModal,
      controller: ConfirmModalCtrl,
      resolve: {
        confirmObject: function () {
          return deleteObject;
        },
      },
    });

    modalInstance.result.then(
      function () {
        // Delete confirmed - delete the encryption key
        encryptionKey.$remove(deleteSuccess, deleteError);
      },
      function () {
        // delete cancelled - do nothing
      }
    );
  };

  /*******************************************/
  /**         Delete Confirmation           **/
  /*******************************************/
}
