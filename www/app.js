var movingHome = angular.module('movingHome', ['ngRoute', 'ngAnimate', 'ui.router',  'ui.bootstrap']);

movingHome.config(function($stateProvider, $urlRouterProvider) {

    var scrollContent = function() {
        // Your favorite scroll method here
        // $window.scrollTo(0, 0);
    };

    $stateProvider
        .state('main', {
            url: '/',
            templateUrl: 'views/main_menu.html',
            controller: 'mainController'
        })

        .state('form', {
            url: '/form',
            templateUrl: 'views/form.html',
            controller: 'formController'
        })

        .state('form.departure', {
            url: '/departure',
            templateUrl: 'views/form-departure.html',
            title: 'Salida',
            position: 0,
            onEnter: scrollContent
        })

        .state('form.images', {
            url: '/images',
            templateUrl: 'views/form-images.html',
            title: 'Imágenes',
            position: 1,
            onEnter: scrollContent
        })


        .state('form.destination', {
            url: '/destination',
            templateUrl: 'views/form-destination.html',
            title: 'Llegada',
            position: 2,
            onEnter: scrollContent
        })

        .state('form.services', {
            url: '/services',
            templateUrl: 'views/form-services.html',
            title: 'Servicios',
            position: 3,
            onEnter: scrollContent
        })

        .state('form.payment', {
            url: '/payment',
            templateUrl: 'views/form-payment.html',
            title: 'Pago',
            position: 4,
            onEnter: scrollContent
        })

        .state('form.contact', {
            url: '/contact',
            templateUrl: 'views/form-contact.html',
            title: 'Contacto',
            position: 5,
            onEnter: scrollContent
        });

    $urlRouterProvider.otherwise('/');

})

movingHome.controller('mainController', ['$scope', '$state', '$uibModal', function($scope, $state, $uibModal) {

  $scope.open = function () {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl'
    });

    modalInstance.result.then(function () {
      // href="#/form/departure"

      $state.go('form.departure')
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

}]);


movingHome.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

movingHome.controller('formController', ['$scope', '$http', '$parse', '$state', '$compile', '$anchorScroll', '$rootScope', '$location' ,'$sce', '$interpolate', '$timeout',function($scope, $http, $parse, $state, $compile, $anchorScroll, $rootScope, $location, $sce, $interpolate, $timeout) {

      $scope.position = $state.current.position;
      $rootScope.$on("$stateChangeSuccess", function (event, currentState, previousState) {
        if($rootScope.mainClass != "main-view"){
          $scope.position = currentState.position
          $location.hash('top');
           // call $anchorScroll()
           $anchorScroll();
         }
      });


      $scope.rooms = [
        { key:'main_entrance',              title: "Entrada Principal"},
        { key:'living_room',                title: "Sala Principal"},
        { key:'kitchen',                    title: "Cocina"},
        { key:'dining_room',                title: "Comedor"},
        { key:'service_room',               title: "Cuarto de servicio"},
        { key:'tv_room',                    title: "Sala de TV"},
        { key:'main_bedroom',               title: "Recámara 1 Principal"},
        { key:'main_bedroom_dressing_room', title: "Vestidor (Recámara Principal)"},
        { key:'kids_bedroom',               title: "Recámara 2 Niños"},
        { key:'kids_bedroom_dressing_room', title: "Vestidor (Recámara Niños)"},
        { key:'extra_bedroom',              title: "Recámara 3"},
        { key:'extra_bedroom_dressing_room',title: "Vestidor (Recámara 3)"},
        { key:'study',                      title: "Oficina/Estudio"},
        { key:'garden',                     title: "Jardinería"},
        { key:'cellar',                     title: "Mini bodega o varios"},
        { key:'access_origin',              title: "Accesos o pasillos (origen)"},
        { key:'access_destination',         title: "Accesos o pasillos (destino)"}
      ];

      // we will store all of our form data in this object
      $scope.formData = {};

      $scope.formData.images = {};

      $scope.selectedRoom = null;

      $scope.pickImage = function(option){
        $scope.selectedRoom = option;
        navigator.camera.getPicture($scope.onPhotoSuccess, $scope.onPhotoFail, { quality: 30,
            allowEdit: true, destinationType: navigator.camera.DestinationType.DATA_URL });
      }

      $scope.onPhotoSuccess = function(imageData){
        if($scope.formData.images[$scope.selectedRoom] == undefined)
          $scope.formData.images[$scope.selectedRoom] = [];

        $scope.formData.images[$scope.selectedRoom].push(imageData);
        $scope.$apply();
      }

      $scope.removeImage = function(image, room){
        function onConfirm(buttonIndex) {
            if(buttonIndex == 1){
              var index = $scope.formData.images[room].indexOf(image);
              $scope.formData.images[room].splice(index, 1);
              $scope.$apply();
            }
        }

        navigator.notification.confirm(
            'Desea borrar esta imagen?', // message
             onConfirm,            // callback to invoke with index of button pressed
            'Moving Home',           // title
            ['Borrar','Cancelar']     // buttonLabels
        );
      }

      $scope.onPhotoFail = function(imageData){
        alert("error on photo");
      }

      $scope.goBack = function(){
        navigator.notification.confirm(
            'Al salir se perderan los datos rellenados en el formulario', // message
             onConfirm,            // callback to invoke with index of button pressed
            'Moving Home',           // title
            ['Salir', 'Cancelar']     // buttonLabels
        );

        function onConfirm(buttonIndex){
          if(buttonIndex == 1){
              $state.go('main');
          }
        }
      }

      $scope.sendMail = function(isValid){

        // Check if empty fields
        if( ($scope.formData.f_departure_country != null && $scope.formData.f_departure_country != '') &&
            ($scope.formData.f_departure_city != null && $scope.formData.f_departure_city != '') &&
            ($scope.formData.f_departure_address != null && $scope.formData.f_departure_address != '') &&
            ($scope.formData.f_departure_type != null && $scope.formData.f_departure_type != '') &&
            ($scope.formData.f_departure_date != null && $scope.formData.f_departure_date != '') &&
            ($scope.formData.f_service_type != null && $scope.formData.f_service_type != '') &&
            ($scope.formData.f_payment_type != null && $scope.formData.f_payment_type != '') &&
            ($scope.formData.f_contact_name != null && $scope.formData.f_contact_name != '') &&
            ($scope.formData.f_contact_email != null && $scope.formData.f_contact_email != '') &&
            ($scope.formData.f_contact_phone != null && $scope.formData.f_contact_phone != '') &&
            ($scope.formData.f_contact_cellphone != null && $scope.formData.f_contact_cellphone != '') &&
            ($scope.formData.f_contact_type != null && $scope.formData.f_contact_type != '')
        ){
          if (isValid) {
             $http.get('email-template.html')
                 .success(function(data) {
                     // angular.extend(_this, data);
                     try {

                        var html = $compile(data)($scope);

                        $timeout(function(){
                              var htmlString = '';
                              for(i=0; i<html.length; i++){
                                if(html[i].outerHTML != undefined)
                                  htmlString += html[i].outerHTML;
                              }
                              
                              try{
                                cordova.plugins.email.open({
                                    to:          "david@moving.com.mx", // email addresses for TO field
                                    attachments:  formatArray($scope.formData.images, $scope.rooms),
                                    subject:      "Mudanzas Moving Home", // subject of the email
                                    body:         htmlString, // email body (for HTML, set isHtml to true)
                                    isHtml:       true, // indicats if the body is HTML or plain text
                                  });
                              }catch(err){
                                alert(err);
                              }

                          },100);

                     } catch (e) {
                         console.error(e.stack);
                         alert(e);
                     }

                 })
                 .error(function(err) {
                   alert(err);
                 });

           }else{

             function alertDismissed() {
                // do something
              }

              navigator.notification.alert(
                  'Por favor, complete todos los campos obligatorios',  // message
                  alertDismissed,         // callback
                  'Moving Home',            // title
                  'Ok'                  // buttonName
              );
           }

        }else{
          function alertDismissed() {
             // do something
           }

           navigator.notification.alert(
               'Por favor, complete todos los campos obligatorios',  // message
               alertDismissed,         // callback
               'Moving Home',            // title
               'Ok'                  // buttonName
           );
        }

      };
}]);

movingHome.run([ '$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
   if (toState.name === 'main') {
      $rootScope.mainClass = "main-view";
    } else if (toState.name === 'form.departure') {
      $rootScope.mainClass = "form-view";
    }
   });

}])

function formatArray(images, rooms){
  var finalArray = [];
  var i = 0;
  rooms.forEach(function(room){
    if(images[room.key] != undefined){
      images[room.key].forEach(function(imageData){
          i++;
          finalArray.push("base64:"+i+".png//" + imageData);
      });
    }
  });
  return finalArray;
}

function convertDataURIToBinary(dataURI) {
  var base64 = dataURI;
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
