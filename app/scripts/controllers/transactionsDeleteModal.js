const MAX_BATCH_SIZE = 64

function * getBatchSizes (currentBatchSize) {
  yield { value: 1, label: 'One at a time' }

  let currentValue = 2
  while (currentValue <= Math.min(currentBatchSize, MAX_BATCH_SIZE)) {
    yield { value: currentValue, label: `${currentValue} at a time` }
    currentValue *= 2
  }
}

export function TransactionsDeleteModalCtrl ($scope, $uibModalInstance, Api, Notify, Alerting, transactionsSelected, deleteTransactionsSelected) {
  $scope.deleteSuccess = false
  $scope.transactionsSelected = transactionsSelected
  $scope.deleteTransactionsSelected = deleteTransactionsSelected
  $scope.taskSetup = {}
  $scope.taskSetup.batchSize = 1
  $scope.taskSetup.paused = false
  $scope.batchSizes = Array.from(
    getBatchSizes($scope.transactionsCount ? $scope.transactionsCount : transactionsSelected.length)
  )

  if (deleteTransactionsSelected === 1 && transactionsSelected.length === 1) {
    Alerting.AlertAddMsg('delete', 'warning', 'This transaction has already been deleted')
  } else if (deleteTransactionsSelected > 0) {
    Alerting.AlertAddMsg('delete', 'warning', deleteTransactionsSelected + ' of these transactions have already been deleted')
  }

  function onSuccess () {
    // On success
    Notify.notify('TasksChanged')
    $scope.deleteSuccess = true
    $scope.$emit('transactionDeleteSuccess')
  };

  function createTask (tIds, onSuccess) {
    for (let tId of tIds) {
      $scope.task = new Api.SingularDelete.delete({ transactionId: tId }, onSuccess)
    }
    $scope.task.$save({}, onSuccess)
  }

  $scope.confirmDelete = function () {
    if ($scope.bulkDeleteActive) {
      const filters = $scope.returnFilters()
      filters.pauseQueue = $scope.taskSetup.paused
      filters.batchSize = $scope.taskSetup.batchSize
      $scope.deleteTasks = new Api.SingularDelete(filters)
      $scope.deleteTasks.$save({}, onSuccess)
    } else {
      createTask($scope.transactionsSelected, onSuccess)
      $scope.deleteTasks.$save({}, onSuccess)
    }
    $scope.deleteSuccess = true
  }

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel')
  }
}
