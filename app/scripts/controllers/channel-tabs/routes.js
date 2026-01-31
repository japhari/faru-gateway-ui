export function channelRoutesCtrl($scope, $timeout, Api, Alerting) {
  /*************************************************/
  /**   Default Channel Routes configurations     **/
  /*************************************************/

  // if channel update is false
  if (!$scope.update) {
    // set default routes array variable
    $scope.channel.routes = []
  }

  $scope.selected = {}
  $scope.mediatorRoutes = []
  $scope.routeAddEdit = false

  // get the mediators for the route option
  Api.Mediators.query(function (mediators) {
    // foreach mediator
    angular.forEach(mediators, function (mediator) {
      // foreach endpoint in the mediator
      angular.forEach(mediator.endpoints, function (endpoint) {
        $scope.mediatorRoutes.push({
          fullName: mediator.name + ' - ' + endpoint.name,
          mediator: mediator.urn,
          endpoint
        })
      })
    })
  }, function () { /* server error - could not connect to API to get Mediators */ })

  // get the Trusted Certificates for the Channel routes cert dropdown
  Api.Keystore.query({ type: 'ca' }, function (result) {
    $scope.trustedCerts = []
    angular.forEach(result, function (cert) {
      $scope.trustedCerts.push({ _id: cert._id, commonName: 'cn=' + cert.commonName })
    })
  },
    function () { /* server error - could not connect to API to get Trusted Certificates */ })

  // get the Encryption Keys for the GovESB routes encryption key dropdown
  Api.EncryptionKeys.query(function (result) {
    $scope.encryptionKeys = []
    angular.forEach(result, function (key) {
      $scope.encryptionKeys.push({ _id: key._id, name: key.name })
    })
  },
    function () { /* server error - could not connect to API to get Encryption Keys */ })

  /*************************************************/
  /**   Default Channel Routes configurations     **/
  /*************************************************/

  /****************************************/
  /**   Functions for Channel Routes     **/
  /****************************************/

  $scope.resetRouteErrors = function () {
    $scope.ngErrorRoute = {}
    Alerting.AlertReset('route')
    Alerting.AlertReset('hasErrorsRoute')
  }

  $scope.saveRoute = function (index) {
    // check for route form errors
    $scope.validateFormRoutes()

    // push the route object to channel.routes if no errors exist
    if ($scope.ngErrorRoute.hasErrors === false) {
      // if index then this is an update - delete old route based on idex
      if (typeof (index) !== 'undefined' && index !== null) {
        // remove old route from array
        $scope.channel.routes.splice(index, 1)
      }

      // add route to channel.routes array
      $scope.channel.routes.push($scope.newRoute)

      // hide add/edit box
      $scope.routeAddEdit = false

      // check for route warnings
      $scope.checkRouteWarnings()
    } else {
      // inform parent controller of route errors
      $scope.ngError.hasRouteWarnings = true
    }
  }

  // remove route
  $scope.removeRoute = function (index) {
    $scope.channel.routes.splice(index, 1)

    // check for route warnings
    $scope.checkRouteWarnings()
  }

  // add route
  $scope.addEditRoute = function (type, object, index) {
    // reset route errors
    $scope.resetRouteErrors()

    $scope.oldRouteIndex = null

    // declare variable for primary route
    let primary

    // create new route object
    if (type === 'new') {
      // show add/edit box
      $scope.routeAddEdit = true

      // if no routes exist yet then make mediator primary
      primary = false
      if ($scope.channel.routes.length === 0) {
        primary = true
      }

      $scope.newRoute = {
        name: '',
        secured: false,
        host: '',
        port: '',
        path: '',
        pathTransform: '',
        primary,
        username: '',
        password: '',
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: false,
        kafkaClientId: '',
        kafkaTopic: '',
        rabbitmqHost: '',
        rabbitmqPort: '5672',
        rabbitmqUsername: '',
        rabbitmqPassword: '',
        rabbitmqExchange: true,
        rabbitmqQueueName: '',
        rabbitmqExchangeName: '',
        rabbitMQExchangeRoutingKey: '',
        waitPrimaryResponse: false,
        statusCodesCheck: '',
        customHeaderKey1: '',
        customHeaderValue1: '',
        customHeaderKey2: '',
        customHeaderValue2: '',
        customHeaderKey3: '',
        customHeaderValue3: '',
        // govesb
        govesbHost: '',
        govesbPort: '',
        govesbPath: '',
        govesbApiCode: '',
        govesbIsPushRequest: true,
        hasDestinationSystem: false,
        apiTypeSending: true,
        encryptionKeyId: null,
        govesbTokenUrl: '',
        govesbEngineUrl: '',
        govesbNidaUserId: '',
        // destination
        destinationSecured: false,
        destinationHost: '',
        destinationPort: '',
        destinationPath: '',
        destinationUsername: '',
        destinationPassword: '',
        destinationCustomHeaderKey1: '',
        destinationCustomHeaderValue1: '',
        destinationCustomHeaderKey2: '',
        destinationCustomHeaderValue2: '',
        destinationCustomHeaderKey3: '',
        destinationCustomHeaderValue3: ''
      }
    } else if (type === 'edit') {
      // show add/edit box
      $scope.routeAddEdit = true

      // set new/edit route to supplied object
      $scope.newRoute = angular.copy(object)
      $scope.oldRouteIndex = index
    }
  }

  $scope.addRouteFromMediator = function () {
    $scope.resetRouteErrors()
    $scope.oldRouteIndex = null

    // dont show add/edit box for mediator add - push directly to channel routes
    $scope.routeAddEdit = false

    // set defaults
    let primary = false
    let name = ''
    let secured = false
    let host = ''
    let port = ''
    let path = ''
    let pathTransform = ''
    let username = ''
    let password = ''
    let routeType = 'http'
    let customHeaderKey1 = ''
    let customHeaderValue1 = ''
    let customHeaderKey2 = ''
    let customHeaderValue2 = ''
    let customHeaderKey3 = ''
    let customHeaderValue3 = ''
    let forwardAuthHeader = false
    // rabbitmq
    let rabbitmqHost = ''
    let rabbitmqPort = '5672'
    let rabbitmqUsername = ''
    let rabbitmqPassword = ''
    let rabbitmqExchange = true
    let rabbitmqQueueName = ''
    let rabbitmqExchangeName = ''
    let rabbitMQExchangeRoutingKey = ''
    // govesb
    let govesbHost = ''
    let govesbPort = ''
    let govesbPath = ''
    let govesbApiCode = ''
    let govesbIsPushRequest = true
    let hasDestinationSystem = false
    let apiTypeSending = true
    // destination
    let destinationSecured = false
    let destinationHost = ''
    let destinationPort = ''
    let destinationPath = ''
    let destinationUsername = ''
    let destinationPassword = ''
    let destinationCustomHeaderKey1 = ''
    let destinationCustomHeaderValue1 = ''
    let destinationCustomHeaderKey2 = ''
    let destinationCustomHeaderValue2 = ''
    let destinationCustomHeaderKey3 = ''
    let destinationCustomHeaderValue3 = ''

    if ($scope.selected.mediatorRoute.endpoint.name) { name = $scope.selected.mediatorRoute.endpoint.name }
    if ($scope.selected.mediatorRoute.endpoint.secured) { secured = $scope.selected.mediatorRoute.endpoint.secured }
    if ($scope.selected.mediatorRoute.endpoint.host) { host = $scope.selected.mediatorRoute.endpoint.host }
    if ($scope.selected.mediatorRoute.endpoint.port) { port = $scope.selected.mediatorRoute.endpoint.port }
    if ($scope.selected.mediatorRoute.endpoint.path) { path = $scope.selected.mediatorRoute.endpoint.path }
    if ($scope.selected.mediatorRoute.endpoint.pathTransform) { pathTransform = $scope.selected.mediatorRoute.endpoint.pathTransform }
    if ($scope.selected.mediatorRoute.endpoint.username) { username = $scope.selected.mediatorRoute.endpoint.username }
    if ($scope.selected.mediatorRoute.endpoint.password) { password = $scope.selected.mediatorRoute.endpoint.password }
    if ($scope.selected.mediatorRoute.endpoint.type) { routeType = $scope.selected.mediatorRoute.endpoint.type }
    if ($scope.selected.mediatorRoute.endpoint.forwardAuthHeader) { forwardAuthHeader = $scope.selected.mediatorRoute.endpoint.forwardAuthHeader }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderKey1) { customHeaderKey1 = $scope.selected.mediatorRoute.endpoint.customHeaderKey1 }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderValue1) { customHeaderValue1 = $scope.selected.mediatorRoute.endpoint.customHeaderValue1 }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderKey2) { customHeaderKey2 = $scope.selected.mediatorRoute.endpoint.customHeaderKey2 }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderValue2) { customHeaderValue2 = $scope.selected.mediatorRoute.endpoint.customHeaderValue2 }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderKey3) { customHeaderKey3 = $scope.selected.mediatorRoute.endpoint.customHeaderKey3 }
    if ($scope.selected.mediatorRoute.endpoint.customHeaderValue3) { customHeaderValue3 = $scope.selected.mediatorRoute.endpoint.customHeaderValue3 }
    // rabbitmq
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqHost) { rabbitmqHost = $scope.selected.mediatorRoute.endpoint.rabbitmqHost }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqPort) { rabbitmqPort = $scope.selected.mediatorRoute.endpoint.rabbitmqPort }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqUsername) { rabbitmqUsername = $scope.selected.mediatorRoute.endpoint.rabbitmqUsername }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqPassword) { rabbitmqPassword = $scope.selected.mediatorRoute.endpoint.rabbitmqPassword }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqExchange) { rabbitmqExchange = $scope.selected.mediatorRoute.endpoint.rabbitmqExchange }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqQueueName) { rabbitmqQueueName = $scope.selected.mediatorRoute.endpoint.rabbitmqQueueName }
    if ($scope.selected.mediatorRoute.endpoint.rabbitmqExchangeName) { rabbitmqExchangeName = $scope.selected.mediatorRoute.endpoint.rabbitmqExchangeName }
    if ($scope.selected.mediatorRoute.endpoint.rabbitMQExchangeRoutingKey) { rabbitMQExchangeRoutingKey = $scope.selected.mediatorRoute.endpoint.rabbitMQExchangeRoutingKey }
    // govesb
    if ($scope.selected.mediatorRoute.endpoint.govesbHost) { govesbHost = $scope.selected.mediatorRoute.endpoint.govesbHost }
    if ($scope.selected.mediatorRoute.endpoint.govesbPort) { govesbPort = $scope.selected.mediatorRoute.endpoint.govesbPort }
    if ($scope.selected.mediatorRoute.endpoint.govesbPath) { govesbPath = $scope.selected.mediatorRoute.endpoint.govesbPath }
    if ($scope.selected.mediatorRoute.endpoint.govesbApiCode) { govesbApiCode = $scope.selected.mediatorRoute.endpoint.govesbApiCode }
    if ($scope.selected.mediatorRoute.endpoint.govesbIsPushRequest) { govesbIsPushRequest = $scope.selected.mediatorRoute.endpoint.govesbIsPushRequest }
    if ($scope.selected.mediatorRoute.endpoint.hasDestinationSystem) { hasDestinationSystem = $scope.selected.mediatorRoute.endpoint.hasDestinationSystem }
    if ($scope.selected.mediatorRoute.endpoint.apiTypeSending) { apiTypeSending = $scope.selected.mediatorRoute.endpoint.apiTypeSending }
    let encryptionKeyId = null
    let govesbTokenUrl = ''
    let govesbEngineUrl = ''
    let govesbNidaUserId = ''
    if ($scope.selected.mediatorRoute.endpoint.encryptionKeyId) { encryptionKeyId = $scope.selected.mediatorRoute.endpoint.encryptionKeyId }
    if ($scope.selected.mediatorRoute.endpoint.govesbTokenUrl) { govesbTokenUrl = $scope.selected.mediatorRoute.endpoint.govesbTokenUrl }
    if ($scope.selected.mediatorRoute.endpoint.govesbEngineUrl) { govesbEngineUrl = $scope.selected.mediatorRoute.endpoint.govesbEngineUrl }
    if ($scope.selected.mediatorRoute.endpoint.govesbNidaUserId) { govesbNidaUserId = $scope.selected.mediatorRoute.endpoint.govesbNidaUserId }
    // destination
    if ($scope.selected.mediatorRoute.endpoint.destinationSecured) { destinationSecured = $scope.selected.mediatorRoute.endpoint.destinationSecured }
    if ($scope.selected.mediatorRoute.endpoint.destinationHost) { destinationHost = $scope.selected.mediatorRoute.endpoint.destinationHost }
    if ($scope.selected.mediatorRoute.endpoint.destinationPort) { destinationPort = $scope.selected.mediatorRoute.endpoint.destinationPort }
    if ($scope.selected.mediatorRoute.endpoint.destinationPath) { destinationPath = $scope.selected.mediatorRoute.endpoint.destinationPath }
    if ($scope.selected.mediatorRoute.endpoint.destinationUsername) { destinationUsername = $scope.selected.mediatorRoute.endpoint.destinationUsername }
    if ($scope.selected.mediatorRoute.endpoint.destinationPassword) { destinationPassword = $scope.selected.mediatorRoute.endpoint.destinationPassword }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey1) { destinationCustomHeaderKey1 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey1 }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue1) { destinationCustomHeaderValue1 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue1 }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey2) { destinationCustomHeaderKey2 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey2 }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue2) { destinationCustomHeaderValue2 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue2 }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey3) { destinationCustomHeaderKey3 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderKey3 }
    if ($scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue3) { destinationCustomHeaderValue3 = $scope.selected.mediatorRoute.endpoint.destinationCustomHeaderValue3 }

    // if no routes exist yet then make mediator primary
    if ($scope.channel.routes.length === 0) {
      primary = true
    }

    // add mediator to channel.routes array
    $scope.channel.routes.push({
      name,
      secured,
      host,
      port,
      path,
      pathTransform,
      primary,
      username,
      password,
      type: routeType,
      status: 'enabled',
      forwardAuthHeader,
      customHeaderKey1,
      customHeaderValue1,
      customHeaderKey2,
      customHeaderValue2,
      customHeaderKey3,
      customHeaderValue3,
      // rabbitmq
      rabbitmqHost,
      rabbitmqPort,
      rabbitmqUsername,
      rabbitmqPassword,
      rabbitmqExchange,
      rabbitmqQueueName,
      rabbitmqExchangeName,
      rabbitMQExchangeRoutingKey,
      // govesb
      govesbHost,
      govesbPort,
      govesbPath,
      govesbApiCode,
      govesbIsPushRequest,
      encryptionKeyId,
      govesbTokenUrl,
      govesbEngineUrl,
      govesbNidaUserId,
      hasDestinationSystem,
      apiTypeSending,
      // destination
      destinationSecured,
      destinationHost,
      destinationPort,
      destinationPath,
      destinationUsername,
      destinationPassword,
      destinationCustomHeaderKey1,
      destinationCustomHeaderValue1,
      destinationCustomHeaderKey2,
      destinationCustomHeaderValue2,
      destinationCustomHeaderKey3,
      destinationCustomHeaderValue3
    })
  }

  $scope.cancelRouteAddEdit = function () {
    // clear timeout if it has been set
    $timeout.cancel($scope.clearValidationRoute)

    $scope.resetRouteErrors()

    // check for route warnings
    $scope.checkRouteWarnings()

    // hide add/edit box
    $scope.routeAddEdit = false
  }

  $scope.onRouteDisable = function (route) {
    route.primary = false
  }

  /****************************************/
  /**   Functions for Channel Routes     **/
  /****************************************/

  /****************************************************/
  /**   Functions for Channel Routes Validations     **/
  /****************************************************/

  $scope.validateFormRoutes = function () {
    // reset hasErrors alert object
    $scope.resetRouteErrors()

    // clear timeout if it has been set
    $timeout.cancel($scope.clearValidationRoute)

    $scope.ngErrorRoute = {}
    $scope.ngErrorRoute.hasErrors = false

    // name validation
    if (!$scope.newRoute.name) {
      $scope.ngErrorRoute.name = true
      $scope.ngErrorRoute.hasErrors = true
    }

    // Status codes validation
    const codeError = $scope.checkIsStatusCodesValid($scope.newRoute.statusCodesCheck)
    if (codeError) {
      $scope.ngErrorRoute.statusCodesCheck = true
      $scope.ngErrorRoute.statusCodesCheckError = codeError
      $scope.ngErrorRoute.hasErrors = true
    }

    // HTTP route type validation
    if ($scope.newRoute.type === 'http') {
      // host validation
      if (!$scope.newRoute.host) {
        $scope.ngErrorRoute.host = true
        $scope.ngErrorRoute.hasErrors = true
      }

      // port validation
      const portError = $scope.checkIsPortValid($scope.newRoute.port)
      if (portError) {
        $scope.ngErrorRoute.port = true
        $scope.ngErrorRoute.portError = portError
        $scope.ngErrorRoute.hasErrors = true
      }

      // path/transform validation
      const pathTransformError = $scope.checkPathTransformPathSet($scope.newRoute)
      if (pathTransformError) {
        $scope.ngErrorRoute.pathTransform = true
        $scope.ngErrorRoute.pathTransformError = pathTransformError
        $scope.ngErrorRoute.hasErrors = true
      }
    }
    // KAFKA route type validation
    if ($scope.newRoute.type === 'kafka') {
      // kafka topic validation
      // const kafkaTopicError = $scope.checkIskafkaTopicValid($scope.newRoute.kafkaTopic)
      // const kafkaTopicError = $scope.checkIskafkaTopicValid($scope.newRoute.kafkaTopic)
      const kafkaTopicError = $scope.checkIskafkaTopicOrRabbitExchangeIsValid($scope.newRoute.kafkaTopic)
      if (kafkaTopicError) {
        $scope.ngErrorRoute.kafkaTopic = true
        $scope.ngErrorRoute.kafkaTopicError = kafkaTopicError
        $scope.ngErrorRoute.hasErrors = true
      }
    }

    // RABBITMQ route type validation
    if ($scope.newRoute.type === 'rabbitmq') {
      // rabbitmq port check
      if (!$scope.newRoute.rabbitmqPort) {
        $scope.ngErrorRoute.rabbitmqPort = true
        $scope.ngErrorRoute.hasErrors = true
      }

      // rabbitmq host check
      if (!$scope.newRoute.rabbitmqHost) {
        $scope.ngErrorRoute.rabbitmqHost = true
        $scope.ngErrorRoute.hasErrors = true
      }

      // rabbitmq username check
      if (!$scope.newRoute.rabbitmqUsername) {
        $scope.ngErrorRoute.rabbitmqUsername = true
        $scope.ngErrorRoute.hasErrors = true
      }

      // rabbitmq password check
      if (!$scope.newRoute.rabbitmqPassword) {
        $scope.ngErrorRoute.rabbitmqPassword = true
        $scope.ngErrorRoute.hasErrors = true
      }

      // rabbitmq exchange validation
      if ($scope.newRoute.rabbitmqExchange) {
        // rabbitmq exchange name check
        if (!$scope.newRoute.rabbitmqExchangeName) {
          $scope.ngErrorRoute.rabbitmqExchangeName = true
          $scope.ngErrorRoute.hasErrors = true
        }

        // rabbitmq exchange routing key check
        if (!$scope.newRoute.rabbitMQExchangeRoutingKey) {
          $scope.ngErrorRoute.rabbitMQExchangeRoutingKey = true
          $scope.ngErrorRoute.hasErrors = true
        }

        // rabbitmq exchange name validation
        if ($scope.newRoute.rabbitmqExchangeName) {
          const rabbitmqExchangeNameError = $scope.checkIskafkaTopicOrRabbitExchangeIsValid($scope.newRoute.rabbitmqExchangeName)
          if (rabbitmqExchangeNameError) {
            $scope.ngErrorRoute.rabbitmqExchangeName = true
            $scope.ngErrorRoute.rabbitmqExchangeNameError = rabbitmqExchangeNameError
            $scope.ngErrorRoute.hasErrors = true
          }
        }
      }

      // rabbitmq queue name validation
      if (!$scope.newRoute.rabbitmqExchange) {
        // rabbitmq queue name check
        if (!$scope.newRoute.rabbitmqQueueName) {
          $scope.ngErrorRoute.rabbitmqQueueName = true
          $scope.ngErrorRoute.hasErrors = true
        }

        if ($scope.newRoute.rabbitmqQueueName) {
          const rabbitmqQueueNameError = $scope.checkIskafkaTopicOrRabbitExchangeIsValid($scope.newRoute.rabbitmqQueueName)
          if (rabbitmqQueueNameError) {
            $scope.ngErrorRoute.rabbitmqQueueName = true
            $scope.ngErrorRoute.rabbitmqQueueNameError = rabbitmqQueueNameError
            $scope.ngErrorRoute.hasErrors = true
          }
        }
      }
    }

    // GovESB route type validation
    if ($scope.newRoute.type === 'govesb') {
      // Require encryption key selection for GovESB routes
      if (!$scope.newRoute.encryptionKeyId) {
        $scope.ngErrorRoute.encryptionKeyId = true
        $scope.ngErrorRoute.hasErrors = true
      }
      // Optional: API code input is recommended but not mandatory
    }

    if ($scope.ngErrorRoute.hasErrors) {
      $scope.clearValidationRoute = $timeout(function () {
        // clear errors after 5 seconds
        $scope.resetRouteErrors()
        $scope.checkRouteWarnings()
      }, 5000)
      Alerting.AlertAddMsg('hasErrorsRoute', 'danger', $scope.validationFormErrorsMsg)
    }
  }

  // check required fields for empty inputs
  $scope.checkIsPortValid = function (value) {
    if (value !== '' && value !== undefined) {
      if (isNaN(value)) {
        // return error message
        return 'Only numbers allowed!'
      } else {
        if (value <= 0 || value > 65536) {
          return 'Not in valid port range!'
        }
      }
    } else {
      return 'This field is required!'
    }
  }

  // check both path and pathTransform isnt supplied
  $scope.checkPathTransformPathSet = function (route) {
    // if both supplied
    if (route.path && route.pathTransform) {
      // return error message
      return 'Cant supply both!'
    }
  }

  // check if topic name is valid by kafka
  $scope.checkIskafkaTopicOrRabbitExchangeIsValid = function (value) {
    if (value) {
      if (value.length > 255) {
        return 'Max length is 255 characters!'
      }
      for (const char of value) {
        if (!/[a-zA-Z0-9\\._\\-]/.test(char)) {
          return 'Not valid topic name! Only letters, numbers, . (dot), _ (underscore), - (minus) can be used!'
        }
      }
    } else {
      return 'This field is required!'
    }
  }

  // validate status codes provided
  $scope.checkIsStatusCodesValid = function (value) {
    if (value !== '' && value !== undefined) {
      const codes = value.split(',')
      for (const code of codes) {
        const validRangeCodes = ['1**', '2**', '3**', '4**', '5**']
        if (Number(code) <= 100 || Number(code) >= 599) {
          return `${code} not a valid status code!`
        } else if (code.includes('*') && !validRangeCodes.includes(code)) {
          return `${code} not a valid range of codes! valid options: ${validRangeCodes}`
        }
      }
    }
  }

  $scope.noRoutes = function () {
    // no routes found - return true
    if (!$scope.channel.routes || $scope.channel.routes.length === 0) {
      Alerting.AlertAddMsg('route', 'warning', 'You must supply atleast one route.')
      return true
    }
    return false
  }

  const isRouteEnabled = function (route) {
    return (typeof route.status === 'undefined' || route.status === null) || route.status === 'enabled'
  }

  $scope.noPrimaries = function () {
    if ($scope.channel.routes) {
      for (let i = 0; i < $scope.channel.routes.length; i++) {
        if (isRouteEnabled($scope.channel.routes[i]) && $scope.channel.routes[i].primary === true) {
          // atleast one primary so return false
          return false
        }
      }
    }
    // return true if no primary routes found
    Alerting.AlertAddMsg('route', 'warning', 'At least one of your enabled routes must be set to primary.')
    return true
  }

  $scope.multiplePrimaries = function () {
    if ($scope.channel.routes) {
      const routes = $scope.channel.routes
      let count = 0
      for (let i = 0; i < routes.length; i++) {
        if (isRouteEnabled(routes[i]) && routes[i].primary === true) {
          count++
        }

        if (count > 1) {
          Alerting.AlertAddMsg('route', 'warning', 'You cannot have multiple primary routes.')
          return true
        }
      }
    }

    return false
  }

  // listen for broadcast from parent controller to check route warnings on save
  $scope.$on('parentSaveRouteAndCheckRouteWarnings', function () {
    // if route add/edit true then save route and check for warning
    if ($scope.routeAddEdit === true) {
      $scope.saveRoute($scope.oldRouteIndex)
    } else {
      $scope.checkRouteWarnings()
    }
  })

  // listen for broadcast from parent controller to check route warnings
  $scope.$on('parentCheckRouteWarnings', function () {
    $scope.checkRouteWarnings()
  })

  $scope.checkRouteWarnings = function () {
    // reset route errors
    $scope.resetRouteErrors()

    const noRoutes = $scope.noRoutes()
    const noPrimaries = $scope.noPrimaries()
    const multiplePrimaries = $scope.multiplePrimaries()

    if (noRoutes || noPrimaries || multiplePrimaries) {
      $scope.ngError.hasRouteWarnings = true
    }
  }

  // check for route warnings on inital load
  if ($scope.update) {
    // make sure promise is completed before checking
    $scope.channel.$promise.then(function () {
      $scope.checkRouteWarnings()
    })
  } else {
    $scope.checkRouteWarnings()
  }

  /****************************************************/
  /**   Functions for Channel Routes Validations     **/
  /****************************************************/
}
