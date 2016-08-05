/*global numeral,FastClick*/
//var moment = require('moment');
/*++++++++++++++++++++ Variables BMS  ++++++++++++++++++++++++++ */
var bmsUser;
var bmsUserName;
var bmsEstab = "";
var bmsEstabName = "";
var bmsTipo; //Pedido o Cobranza
var bmsServer;
     
var estabOriginalCod = "";
var estabOriginalNom = "";

var bmsPermisos = [];
/*+++++++++++++++++++++ Pedido    +++++++++++++++++++++++++++++++ */
var bmsCliente = "";
var bmsLineaDetalle = [];
var bmsFecha = new Date();
var bmsNotas = "";
var bmsCondDistrib = "";
var bmsPedImporte = 0.00;
var bmsPedIva = 0.00;
var bmsPedTotal = 0.00;
var bmsLatitude;
var bmsLongitude;
var bmsMultiestab = false;
/*+++++++++++++++++++++ Cliente   +++++++++++++++++++++++++++++++ */
var bmsLPV;
var bmsCondPago;
var bmsSaldo = 0;
var bmsSucursal;
/*+++++++++++++++++++++ Productos +++++++++++++++++++++++++++++++ */
var bmsProducto;
var bmsUnidad;
var bmsCantidad = 0;
var bmsPeso;
var bmsVolumen;
var bmsPrecio;
var bmsFichaTec;
var bmsFichas = [];
var bmsProdImporte;
var bmsProdIva;
var bmsProdTotal;
var bmsTotalConIva = 0;
var bmsProdEstab;
var prodAutorizado;
var idAut;
var usuarioAut;
var msgAut;
/*+++++++++++++++++++++ Unidades +++++++++++++++++++++++++++++++ */
var bmsUnidadNombre;
     
var prodObj = {};
var prodObjModif = {};
var iProdObjModif = -1;
var pedCab = {};
var pedProd = {};
var pedLineas = [];
var pedidoGuardado = false;
var Editando = false;

/*+++++++++++++++++++++ --------- +++++++++++++++++++++++++++++++ */
//var currentTime = new Date();
function producto(codigo, descripcion, unidad, unidadNombre, cantidad, peso, volumen, precio, importe, iva, total
                  , precioOriginal, prodEstab, prodEstabName, fichas, fichatec, comentario, prodAutorizado) {
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.unidad = unidad;
    this.unidadNombre = unidadNombre;
    this.cantidad = cantidad;
    this.peso = peso;
    this.volumen = volumen;
    this.precio = precio;
    this.importe = importe;
    this.iva = iva;
    this.total = total;
    this.precioOriginal = precioOriginal;
    this.prodEstab = prodEstab;
    this.prodEstabName = prodEstabName;
    this.fichas = fichas;
    this.fichatec = fichatec;
    this.comentario = comentario;
    this.prodAutorizado = prodAutorizado;
}

function pedidoPost (cliente, establecimiento, fecha, notas, sucursal, usuario, productos) {
    this.cliente = cliente;
    this.estab = establecimiento;
    this.fecha = fecha;
    this.notas = notas;
    this.sucursal = sucursal;
    this.user = usuario;
    this.productos = productos;    
}

function pedidoProd (codigo, cantidad, precio, unidad, peso, estab, comentario) {
    this.codigo = codigo;
    this.cantidad = cantidad;
    this.precio = precio;
    this.unidad = unidad;
    this.peso = peso;
    this.estab = estab;
    this.comentario = comentario;
}

function fichaTecnica(dato, valor) {
    this.dato = dato;
    this.valor = valor;
}

function logGlobal() {
    console.log('***DEBUGGING LOG - [Page: logGlobal()] [\n' + '******* PEDIDO *******' + '\n' +
                'Data: bmsCliente = ' + bmsCliente + '\n' +
                'Data: bmsFecha = ' + bmsFecha + '\n' +
                'Data: bmsNotas = ' + bmsNotas + '\n' +
                'Data: bmsPedImporte = ' + bmsPedImporte + '\n' +
                'Data: bmsPedIva = ' + bmsPedIva + '\n' +
                'Data: bmsPedTotal = ' + bmsPedTotal + '\n' +
                '******* CLIENTE *******' + '\n' + 
                'Data: bmsLPV = ' + bmsLPV + '\n' +
                'Data: bmsCondPago = ' + bmsCondPago + '\n' + 
                'Data: bmsSaldo = ' + bmsSaldo + '\n' + 
                'Data: bmsSucursal = ' + bmsSucursal + '\n' + 
                '******* PRODUCTO *******' + '\n' +
                'Data: bmsProducto = ' + bmsProducto + '\n' +
                'Data: bmsUnidad = ' + bmsUnidad + '\n' +
                'Data: bmsUnidadNombre = ' + bmsUnidadNombre + '\n' + 
                'Data: bmsCantidad = ' + bmsCantidad + '\n' + 
                'Data: bmsPeso = ' + bmsPeso + '\n' +
                'Data: bmsVolumen = ' + bmsVolumen + '\n' +
                'Data: bmsPrecio = ' + bmsPrecio + '\n' + 
                'Data: bmsProdImporte = ' + bmsProdImporte + '\n' + 
                'Data: bmsProdIva = ' + bmsProdIva + '\n' +
                'Data: bmsProdTotal = ' + bmsProdTotal + '\n' + 
                'Data: prodObj = ' + JSON.stringify(prodObj) + '\n' + ']');
}

// Manejo de base de datos 

// global variables DB
var db;
var shortName = 'WebSqlDB';
var version = '1.0';
var displayName = 'WebSqlDB';
var maxSize = 65535;

function alertBox(msg, cb, title, btnName) {
    navigator.notification.alert(
        msg, // message
        cb, // callback
        title, // title
        btnName     // buttonName
        );
}

function cbDefault() {
    //CallBack del alertBox:Hacer algo.
} 
//SWIPE LIST AQUÍ ESTABA

$(document).on("pageshow", "#pedidoDetalle", function() {
    $('#list').empty();
    var length = bmsLineaDetalle.length,
        obj = null,
        html = "",
        i; 
    
    for (i = 0; i < length; i++) {
        obj = bmsLineaDetalle[i];
        html += "<li class='" + "item" + "'data-value='" + obj.codigo + "'><a href='#'>" + 
                "<p class=" + "topic" + ">" + obj.descripcion + "</p>" +
                "<p class=" + "topic" + "><strong>Cant: </strong>" + obj.cantidad + " &nbsp; <strong>Unidad: </strong>" + obj.unidadNombre + "</p>" +
                "<p><strong>TOTAL: </strong>" + numeral(obj.total).format('$0,0.00') + "</p>" +
                "<p class=" + "topic" + "><strong>Estab: </strong>" + obj.prodEstabName + " &nbsp; <strong>Ficha téc: </strong>" + obj.comentario + "</p>" +
                "</a><a href='#' class=" + "delete" + ">Delete</a></li>";
    }
    $('#list').append(html);
    $("#list").listview("refresh");
});

$(document).on("pageshow", "#reporteFiltro", function() {
    $('#reporteFiltro_txtUsuarioNombre').val(bmsUserName);
    document.getElementById("reporteFiltro_dtpA").valueAsDate = new Date();
    document.getElementById("reporteFiltro_dtpDe").valueAsDate = new Date();
});

function errorHandler(transaction, error) {
    console.log('Error: ' + error.message + ' code: ' + error.code);
}

function successCallBack() {
    //alert("DEBUGGING: success");
}

function nullHandler() {
}

function renderEntries(tx, result) {
    //alert("DEBUGGING: We are on renderEntries()");
    if (result.rows.length === 0) {
        console.log("No se trajo registros con el SELECT");
    } else {
        var row = result.rows.item(0);
        console.log('***DEBUGGING LOG - [Page: Config - SQL SELECT] [Data: row.serverText  ' + row.serverText);
        document.getElementById("config_servidor").value = row.serverText;
        console.log('***DEBUGGING LOG - [Page: Config] [Data: bmsServer =  ' + row.serverText);
        bmsServer = row.serverText;
    }
}

function queryDB() {
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT serverText FROM Config ORDER BY serverId DESC LIMIT 1;', [], renderEntries, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

function onDeviceReady() {
    document.addEventListener("backbutton", function(e) {
        if ($.mobile.activePage.is('#Login')) {
            console.log("DEBUGGING: [BackButton event] Sí Entró al If");
            e.preventDefault();
            navigator.app.exitApp();
        } else {
            console.log("DEBUGGING: [BackButton event] No Entró al If");
        }
    }, false);
}
// called when the application loads 
function onBodyLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    //alert("DEBUGGING: we are in the onBodyLoad() function"); 

    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }

    db = window.openDatabase(shortName, version, displayName, maxSize);
    queryDB();

    // this line will try to create the table User in the database just created/openned 
    db.transaction(function(tx) {
        //tx.executeSql( 'CREATE TABLE IF NOT EXISTS Config(serverId INTEGER NOT NULL PRIMARY KEY, serverText TEXT NOT NULL)',[],nullHandler,errorHandler);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Config(serverId INTEGER NOT NULL PRIMARY KEY, serverText TEXT NOT NULL)', [], nullHandler, errorHandler);
    }, errorHandler, successCallBack);
    //alert('DB Created!');
}
// list the values in the database to the screen using jquery to update the ##config_servidor element
function AddValueToDB() {
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }

    bmsServer = $('#config_servidor').val();
    db.transaction(function(transaction) {
        transaction.executeSql('INSERT INTO Config(serverText) VALUES (?)', [bmsServer],
                               nullHandler, errorHandler);
        console.log('***DEBUGGING LOG - [Page: config] [Data: bmsServer = ' + bmsServer + ']');
        alertBox("Información guardada: " + bmsServer, null, "BMS Móvil", "OK");
        //alert('Información guardada: ' + bmsServer);
        //$('#config').dialog("close");
        $.mobile.changePage('#Login', {changeHash: true});
    });
    //return false;
}

function clickScan(type) {
    if (type === 1) {//Si es producto
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (result.text !== null || result.text !== "") {
                    addProducto(result.text);
                    return;
                    /*alert("We got a barcode\n" +
                    "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled);*/
                }else if (cancelled.result === 1) {
                    return;
                }
            },
            function (error) {
                alertBox("Error al scanear el código. Inténtelo de nuevo. ERROR: " + error, null, "BMS Móvil", "OK");
                //alert("Error al scanear el código. Inténtelo de nuevo. ERROR: " + error);
            });
    } else if (type === 2) {//Es cliente
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (result !== null || result.text !== "") {
                    addCliente(result.text);
                    getLocalizacion();
                    return;
                    /*alert("We got a barcode\n" +
                    "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled);*/
                } else if (cancelled.result === 1) {
                    return;
                }
            }, 
            function (error) {
                alertBox("Error al scanear el código. Inténtelo de nuevo. ERROR: " + error, null, "BMS Móvil", "OK");
                //alert("Error al scanear el código. Inténtelo de nuevo. ERROR: " + error);
            });
    }
}

function getLocalizacion () {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}
// onSuccess Geolocation
//
function onSuccess(position) {
    bmsLatitude = position.coords.latitude;
    bmsLongitude = position.coords.longitude;
    guardaLocalizacion();
    //alertBox("Localización - Latitude:" + position.coords.latitude + " Longitude:" + position.coords.longitude , null, "BMS Móvil", "OK");
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('Error: No se pudo definir la localización. Code: ' + error.code + '\n' +
          'Message: ' + error.message + '\n');
}

function guardaLocalizacion() {
    var url = bmsServer + "/api/General/GetGuardarGPS",
             
        success = function(data) {
            if (data !== null) {
                //alertBox("La información se ha guardado correctamente. Folio de guardado: " + JSON.stringify(data[0]), null, "BMS Móvil", "OK");
                //pedidoGuardado = true;                 
                return;
            } else {
                alertBox("No se pudo guardar la localización en la base de datos. ERROR: " + JSON.stringify(data[1]), null, "BMS Móvil", "OK");
            }
        };

    //Llamada al web service 
    $.ajax({
               timeout: 10000,
               type: 'GET',
               url: url,
               data: {"usuario":bmsUser, "cliente":bmsCliente, "latitud":bmsLatitude, "longitud":bmsLongitude},//,"latitud":bmsLatitude,"longitud":bmsLongitude},
               dataType: "json",
               crossDomain: false,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}

function validateForm() {
    var x = document.getElementById("text1").value,
        y = document.getElementById("text2").value,
        band = true;
    bmsServer = document.getElementById("config_servidor").value;
    
    x = x.trim();
    y = y.trim();
    if (x === null || x === "") {
        alertBox("Por favor indique su nombre de usuario.", null, "BMS Móvil", "OK");
        //alert("Por favor indique su nombre de usuario.");
        band = false;
        return band;
    }  
    if (y === null || y === "") {
        alertBox("Por favor indique su contraseña.", null, "BMS Móvil", "OK");
        //alert("Por favor indique su contraseña.");
        band = false;
        return band;
    }  
    if (bmsServer === null || bmsServer === "") {
        alertBox("Por favor indique un servidor en el panel de configuración.", null, "BMS Móvil", "OK");
        //alert("Por favor indique un servidor en el panel de configuración.");
        band = false;
        return band;
    }
    return true;
}

function limpiaProducto() {
    //Limpia el formulario de producto y se resetean las variables globales de los valores de pedido
    $('#productos_txtProducto').val('');
    $('#productos_txtEstab').val('');
    $('#productos_listaUnidad').empty();
    $("#productos_listaUnidad").selectmenu();
    $("#productos_listaUnidad").selectmenu('refresh');
    $('#productos_txtCantidad').val('');
    $('#productos_txtPeso').val('');
    $('#productos_txtVolumen').val('');
    $('#productos_txtPrecioUni').val('');
    $('#productos_txtImporte').val('');
    $('#productos_txtIva').val('');
    $('#productos_txtTotal').val('');

    $('#productosEditar_txtProducto').val('');
    $('#productosEditar_listaUnidad').empty();
    $("#productosEditar_listaUnidad").selectmenu();
    $("#productosEditar_listaUnidad").selectmenu('refresh');
    $('#productosEditar_txtCantidad').val('');
    $('#productosEditar_txtPeso').val('');
    $('#productosEditar_txtVolumen').val('');
    $('#productosEditar_txtPrecioUni').val('');
    $('#productosEditar_txtImporte').val('');
    $('#productosEditar_txtIva').val('');
    $('#productosEditar_txtTotal').val('');

    //Limpiar variables
    bmsProdImporte = 0;
    bmsProdIva = 0;
    bmsProdTotal = 0;
    prodObj = {};
    prodObjModif = {};
    iProdObjModif = -1;

    bmsProducto = "";
    bmsUnidad = "";
    bmsCantidad = 0;
    bmsPeso = 0;
    bmsVolumen = 0;
    bmsPrecio = 0.0;
    bmsFichaTec = "";
    bmsFichas = [];
    bmsProdEstab = "";

    bmsUnidadNombre = "";
    prodAutorizado = "";
}

function nuevoPedido() {
    limpiaProducto();
    $('form').clearForm();
    bmsCliente = "";
    
    bmsLineaDetalle = [];
    pedLineas = [];
    bmsFecha = new Date();
    bmsNotas = "";
    bmsPedImporte = 0.00;
    bmsPedIva = 0.00;
    bmsPedTotal = 0.00;
    bmsCondDistrib = "-1";
    bmsSucursal = "";
    bmsMultiestab = false;

    bmsLatitude = null;
    bmsLongitude = null;
    document.getElementById("pedido_txtImporte").value = numeral(bmsPedImporte).format('$0,0.00');
    document.getElementById("pedido_txtIva").value = numeral(bmsPedIva).format('$0,0.00');
    document.getElementById("pedido_txtTotal").value = numeral(bmsPedTotal).format('$0,0.00');
    document.getElementById("pedido_dtpFecha").valueAsDate = bmsFecha;
    document.getElementById("config_servidor").value = bmsServer;

    $("#pedido_CondDistrib").val("-1");
    $("#pedido_CondDistrib").selectmenu('refresh', true);
}

function getParametros() {
    var url = bmsServer + "/Api/Productos/GetParametros",
     
        success = function(data) {
            if (data !== null) {
                //alertBox("Se han cargado los parametros de la aplicación correctamente.", null, "BMS Móvil", "OK");
                bmsPermisos = data;
            }
        };

    //Llamada al web service 
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alertBox("No se pudieron cargar los parametros de la aplicación. Verifique los datos de conexión.", null, "BMS Móvil", "OK");
               }
           });
}

function tienePermiso(val) {
    var permiso = false;
    if (bmsPermisos.length === 0) {
        alertBox("No se han cargado parametros en la aplicación.", null, "BMS Móvil", "OK");
        return permiso;
    }
    for (var i = 0; i < bmsPermisos.length; i++) {
        if (bmsPermisos[i].nombre === val) {
            if ((bmsPermisos[i].valor).trim() === "1") {
                permiso = true;
                return permiso;
            }        
            break;
        }
        return permiso;
    }
}

function addProducto(val) {
    if (val === null || val === "") {
        return;
    }
    bmsProducto = val;
    console.log('***DEBUGGING LOG - [Page: buscaProducto function addProducto()] [Data: codProducto = ' + val +
                ']');
    document.getElementById("productos_txtProducto").value = val;
    $('input[data-type="search"]').val("");
    $('#autocompleteProds').empty();
    $('#productos_infadicional').empty();
    var url = bmsServer + "/api/Productos/GetProducto",
        html = "", 
        htmlinfadic ="",
        success = function(data) {
            if (data.codigo !== null) {
                //if (data.ventas !== true) { 
                //    alertBox("El producto " + bmsProducto + " no se puede vender.", null, "BMS Móvil", "OK");
                //    $('#productos_txtProducto').val('');
                //    return;
                //}
                $('#productos_listaUnidad').empty();
                  
                bmsUnidad = "U";
                bmsUnidadNombre = data.unidades[0].nombre;
                bmsCantidad = 1;
                bmsPeso = data.peso;
                bmsVolumen = data.volumen;
                bmsPrecio = data.precioUC;
                bmsFichaTec = data.fichaTecnica
                bmsProdEstab = estabOriginalCod;
                bmsEstabName = estabOriginalNom;
                document.getElementById("productos_txtEstab").value = estabOriginalNom;
                document.getElementById("productos_txtProducto").value = data.descripcion;
                 
                document.getElementById("productos_txtPeso").value = numeral(data.peso).format('0.000');
                document.getElementById("productos_txtVolumen").value = numeral(data.volumen).format('0.000');
                document.getElementById("productos_txtPrecioUni").value = numeral(data.precioUC).format('$0,0.00');
                document.getElementById("productos_txtCantidad").value = bmsCantidad;
                $("#productos_btnFT").css('display', 'block')
                if (bmsFichaTec === "") {
                    $("#productos_btnFT").css('display', 'none');
                }
                if (data.informacionAdicional !== undefined && data.informacionAdicional !== "") 
                {   
                    htmlinfadic += "<div data-role='collapsible'><h3>Información adcional</h3><p>" + data.informacionAdicional + "</p></div>";
                    $('#productos_infadicional').append(htmlinfadic).collapsibleset('refresh');
                }
                prodObj = data;
                actualizaTotalesProducto(1, 0);                 
                 
                $.each(data.unidades, function(i, val) {
                    html += '<option value="' + val.tipo + '">' + val.nombre + '</option>';                    
                });
                
                $('#productos_listaUnidad').append(html);
                $("#productos_listaUnidad").val(bmsUnidad);
                $("#productos_listaUnidad").selectmenu('refresh', true);

                $('#productos_txtCantidad').focus();
                $('#productos_txtCantidad').select();
            }
            if (data.codigo === null) {
                alertBox("No se encontró el código: " + bmsProducto, null, "BMS Móvil", "OK");
                document.getElementById("productos_txtProducto").value = "";
                $("productos_txtProducto").focus();
            }
        };
 
    $.ajax({
               timeout: 7000,
               type: 'get',
               url: url,
               data: {
            "cliente": bmsCliente,
            "estab"  : bmsEstab,
            "producto": bmsProducto
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alertBox("No se pudo conectar. Verifique su conexión. Error: " + errorThrown, null, "BMS Móvil", "OK");
               }
           });
}
//Busca Producto
$(document).on("pageinit", "#buscaProducto", function() {
    $("#autocompleteProds").on("listviewbeforefilter", function(e, data) {
        var $ul = $(this),
            $input = $(data.input),
            value = $input.val(),
            html = "";
        $ul.html("");
        if (value && value.length > 2) {
            $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
            $ul.listview("refresh");
            $.ajax({
                       url: bmsServer + "/api/Productos/GetBuscarProductos",
                       type: "GET",
                       dataType: "jsonp",
                       crossDomain: true,
                       data: {
                    estab: bmsEstab,
                    filtro: $input.val()
                }
                   })
                .then(function(response) {
                    $.each(response, function(i, val) {
                        html += "<li id='" + val.codigo + "' data-icon=" + "plus" + ">" + "<a href='#' data-ajax='false'><h2 class='ui-li-heading-descrip'>" + val.descripcion + "</h2><p class=" + "ui-li-desc" + "> Exist: " + val.existenciaEstablecimiento + "</p> <p class=" + "ui-li-desc" + "> Exist Global: " + val.existenciaGlobal + "</p></a></li>";
                    });
                    $ul.html(html);
                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
                });
        }
    });
    
    $('#autocompleteProds').on('tap', 'li', function (event) {
        var codigo = variable = $(this).attr('id');
        addProducto(codigo);
        $.mobile.changePage('#productos', {changeHash: true});
    }); 
});

$(document).on("scrollstop", function (e) {
    var activePage = $.mobile.activePage,
        screenHeight = $.mobile.getScreenHeight(),
        contentHeight = $(".ui-content", activePage).outerHeight(),
        scrolled = $(window).scrollTop(),
        header = $(".ui-header", activePage).hasClass("ui-header-fixed") ? $(".ui-header", activePage).outerHeight() - 1 : $(".ui-header", activePage).outerHeight(),
        footer = $(".ui-footer", activePage).hasClass("ui-footer-fixed") ? $(".ui-footer", activePage).outerHeight() - 1 : $(".ui-footer", activePage).outerHeight(),
        scrollEnd = contentHeight - screenHeight + header + footer;
    if (activePage[0].id === "buscaProducto" && scrolled >= scrollEnd) {
        var regs = $('#autocompleteProds li').length,
            pag = Math.ceil(regs / 10);
        if (regs >= 10 && regs < 100 && pag >= 1) {
            pag = pag + 1;
            var lista = $("#autocompleteProds"),
                texto = $("#autocompleteProds").prev('form').find('input').val();
            buscarMasProducto(lista, texto, pag);
        }
    }
});

function buscarMasProducto(lista, filtro, pag) {
    var html = lista.html();
    if (filtro.length > 2) {
        $.ajax({
                   url: bmsServer + "/api/Productos/GetBuscarProductos",
                   type: "GET",
                   dataType: "jsonp",
                   crossDomain: true,
                   data: {
                estab: bmsEstab,
                filtro: filtro,
                pagina:pag
            }
               })
            .then(function(response) {
                $.each(response, function(i, val) {
                    html += "<li id='" + val.codigo + "' data-icon=" + "plus" + ">" + "<a href='#'><h2 class='ui-li-heading-descrip'>" + val.descripcion + "</h2><p class=" + "ui-li-desc" + "> Exist: " + val.existenciaEstablecimiento + "</p> <p class=" + "ui-li-desc" + "> Exist Global: " + val.existenciaGlobal + "</p></a></li>";
                });
                lista.html(html);
                lista.listview("refresh");
                lista.trigger("updatelayout");
            });
    }	
}

function modificaProducto(val) {
    iProdObjModif = val;                 //Recibo el indice del producto a modificar
    prodObjModif = bmsLineaDetalle[val]; //Hago una copia del objeto a modificar
    var codProd = prodObjModif.codigo,
        url = bmsServer + "/api/Productos/GetProducto",
        html = "";
    console.log('***DEBUGGING LOG - [Page: modificaProducto function modificaProducto()] [Data: codProducto = ' + codProd + ']');
    document.getElementById("productosEditar_txtProducto").value = codProd;
         
    var success = function(data) {
        if (data.codigo !== "") {
            $('#productosEditar_listaUnidad').empty();
            
            $.each(data.unidades, function(i, val) {
                html += '<option value="' + val.tipo + '">' + val.nombre + '</option>';                    
            });
                
            $('#productosEditar_listaUnidad').append(html);
                
            prodObj = data; 
            bmsUnidad = prodObjModif.unidad;
            bmsUnidadNombre = prodObjModif.unidadNombre;
            bmsCantidad = prodObjModif.cantidad;
            bmsFichas = prodObjModif.fichas;
            bmsFichaTec = prodObjModif.fichatec;
            bmsPeso = data.peso;
            bmsVolumen = data.volumen;
            bmsPrecio = prodObjModif.precio;
            bmsProdImporte = prodObjModif.importe;
            bmsProdIva = prodObjModif.iva;
            bmsProdTotal = prodObjModif.total;
            bmsProdEstab = prodObjModif.prodEstab;
            bmsEstabName = prodObjModif.prodEstabName;
            bmsProducto = prodObjModif.codigo;
            prodAutorizado = prodObjModif.prodAutorizado
            
            $("#productosEditar_listaUnidad").val(bmsUnidad);
            $("#productosEditar_listaUnidad").selectmenu('refresh', true);
            
            document.getElementById("productosEditar_txtProducto").value = data.descripcion;
                 
            document.getElementById("productosEditar_txtPeso").value = numeral(data.peso).format('0.000');
            document.getElementById("productosEditar_txtVolumen").value = numeral(data.volumen).format('0.000');
            document.getElementById("productosEditar_txtPrecioUni").value = numeral(prodObjModif.precio).format('$0,0.00');
                 
            document.getElementById("productosEditar_txtCantidad").value = prodObjModif.cantidad;

            document.getElementById("productosEditar_txtImporte").value = numeral(prodObjModif.importe).format('$0,0.00'); 
            document.getElementById("productosEditar_txtIva").value = numeral(prodObjModif.iva).format('$0,0.00');
            document.getElementById("productosEditar_txtTotal").value = numeral(prodObjModif.total).format('$0,0.00');

            document.getElementById("productosEditar_txtEstab").value = prodObjModif.prodEstabName;
            
            $("#productosEditar_btnFT").css('display', 'block');
            if (bmsFichaTec === "") {
                $("#productosEditar_btnFT").css('display', 'none');
            }
        }
    };
 
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {
            "cliente": bmsCliente,
            "estab"  : bmsEstab,
            "producto": codProd
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}
//Crear autorización remota
function autorizacionRemota() {
    usuarioAut = $("#AutRemota_radios :radio:checked").val();
    if (usuarioAut === undefined || usuarioAut === "") {
        alertBox("No ha seleccionado usuario para autorización", null, "BMS Móvil", "Ok");
        return;
    }
    usuarioAut = $("#AutRemota_radios :radio:checked")[0].id;
    idAut = -1;
    var url = bmsServer + "/api/General/GetIdAutRemota",
        success = function(data) {
            if (data === -1) { 
                alertBox("No se pudo generar la solicitud de autorización", null, "BMS Móvil", "OK");
                return;
            } else { 
                idAut = data;
                $('#AutRemota_btnAutRemota').addClass('ui-disabled');
                console.log('id' + data);
            }
        };
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {
            "cliente": bmsCliente, "prod": bmsProducto, "unidad": bmsUnidad, "cant": bmsCantidad, "precio": bmsPrecio, "condpago":bmsCondPago, "usuario":bmsUser, "estab": bmsEstab, "usuarioAut": usuarioAut, "mensaje" : msgAut
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}
function cerrarAutRemota() {
    if (Editando) {
        $.mobile.changePage('#productosEditar', {changeHash: true});
    } else {
        $.mobile.changePage('#productos', {changeHash: true});
    }
}
//Verificar si ya se autorizó
function verificarAutRemota() {
    if (idAut===-1) {
        alertBox("No ha generado una solicitud de autorización", null, "BMS Móvil", "Ok");
        return;
    }
    var url = bmsServer + "/api/General/GetVerificarAutRemota",
        success = function(data) {
            if (data === "") { 
                alertBox("Aun no se ha repondido la solicitud de autorización", null, "BMS Móvil", "OK");
                return;
            } else { 
                if (data==="N") {
                    prodAutorizado = "NO";
                    idAut = -1;
                    alertBox("Su solicitud no ha sido autorizada", null, "BMS Móvil", "OK");
                    if (Editando) {
                        $.mobile.changePage('#productosEditar', {changeHash: true});
                    } else {
                        $.mobile.changePage('#productos', {changeHash: true});
                    }
                } else {
                    prodAutorizado = "SI";
                    idAut = -1;
                    if (Editando) {
                        $.mobile.changePage('#productosEditar', {changeHash: true});
                        modificaDetalle();
                    } else {
                        $.mobile.changePage('#productos', {changeHash: true});
                        incluyeProducto();
                    }
                }
            }
        };
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {
            "id": idAut
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}
//Traer cartera del cliente
function TraerCartera() {
    var html = "",
        url = bmsServer + "/api/Clientes/GetCarteraCliente",
        success = function(data) {
            html += "<thead>";
            html += "<tr>";
            html += "<th>Folio</th><th>Transaccion</th><th>Fecha</th><th>Total</th><th>Saldo</th>";
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";
            $.each(data, function(i, val) {
                html += "<tr><td>" + val.folio + "</td><td>" + val.transaccion + "</td><td>" + val.fecha + "</td><td>" + val.total + "</td><td>" + val.saldo + "</td></tr>";
            });
            html += "</tbody>";
            html +="</table>"
            $('#CarteraCte_Tabla').empty();
            $('#CarteraCte_Tabla').html(html);
        };
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {"cliente": bmsCliente},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}

//Llama al webservice que se trae el detalle del cliente mandandole el codigoCte 
function addCliente(val) {
    if (val === null || val === "") {
        return;
    }
    bmsCliente = val;
    console.log('***DEBUGGING LOG - [Page: buscaCliente function addCliente()] [Data: codCte = ' + val +
                ']');
    document.getElementById("clienteDetalle_txtCliente").value = val;
    $('input[data-type="search"]').val("");
    $('#autocompleteCtes').empty();
    //$('input[data-type="search"]').trigger("change");

    var url = bmsServer + "/api/Clientes/GetCliente",
        html = '<option value="' + '' + '">' + "Seleccione..." + '</option>',
        html2 = '',
        success = function(data) {
            if (data.codigo === null) {
                alertBox("No se encontró el código: " + bmsCliente, null, "BMS Móvil", "OK");
                document.getElementById("clienteDetalle_txtCliente").value = "";
            }
            if (data.codigo !== null) {
                $('#clienteDetalle_listaSucursales').empty();
                $('#clienteDetalle_listaCondiciones').empty();
                //alert("Llenar combo.");
                //console.log(data);
                bmsSucursal = "";
                document.getElementById("clienteDetalle_txtCodCte").value = data.codigo;
                document.getElementById("pedido_txtCliente").value = data.razonSocial;
                document.getElementById("clienteDetalle_txtCliente").value = data.razonSocial;
                bmsCliente = data.codigo;
                document.getElementById("clienteDetalle_txtLPV").value = data.listaPrecios;
                bmsLPV = data.idListaPrecios;
                //document.getElementById("clienteDetalle_txtCondPago").value = data.condicionPago;
                bmsCondPago = data.idCondicionPago;
                document.getElementById("clienteDetalle_txtSaldo").value = numeral(data.saldo).format('$0,0.00');
                bmsSaldo = data.saldo;
           
                $.each(data.sucursales, function(i, val) {
                    html += '<option value="' + val.codigo + '">' + val.nombre + '</option>';
                });
                $.each(data.condicionesPago, function(i, val) {
                    html2 += '<option value="' + val.codigo + '">' + val.nombre + '</option>';
                });

                $('#clienteDetalle_listaSucursales').append(html);
                $("#clienteDetalle_listaSucursales").selectmenu('refresh', true);

                $('#clienteDetalle_listaCondiciones').append(html2);
                $("#clienteDetalle_listaCondiciones").selectmenu('refresh', true);

                $('#clienteDetalle_listaCondiciones').val(bmsCondPago);
                $("#clienteDetalle_listaCondiciones").selectmenu('refresh', true);
            }
        };

    //Llamada al web service GetEstabs 
    $.ajax({
               timeout: 7000,
               type: 'get',
               url: url,
               data: {
            "cliente": val
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alertBox("No se pudo conectar. Verifique su conexión. Error: " + errorThrown, null, "BMS Móvil", "OK");
               }
           });
}

//Busca Cliente
$(document).on("pageinit", "#buscaCliente", function() {
    $("#autocompleteCtes").on("listviewbeforefilter", function(e, data) {
        var $ul = $(this),
            $input = $(data.input),
            value = $input.val(),
            html = "";
        $ul.html("");
        if (value && value.length > 2) {
            $ul.html("<li ><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
            $ul.listview("refresh");
            $.ajax({
                       url: bmsServer + "/api/Clientes/GetBuscarClientes",
                       type: "GET",
                       dataType: "jsonp",
                       crossDomain: true,
                       data: {
                    estab: bmsEstab,
                    filtro: $input.val()
                }
                   })
                .then(function(response) {
                    $.each(response, function(i, val) {
                        html += "<li " + "data-icon=" + "plus" + " id= '" + val.codigo + "' data-liCtesCod= '" + val.codigo + "' data-liCtesNom='" + val.nombre + "><a href='#' data-ajax='false'><h3 class='ui-li-heading-descrip'>" + val.nombre + "</h3><p class=" + "ui-li-desc" + "> Código: " + val.codigo + "</p><p class ='ul-li-desc'>" + val.domicilio + "</p></a></li>";
                    });
                    $ul.html(html);
                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
                });
        }
    });
    
    $('#autocompleteCtes').on('tap', 'li', function (event) {
        var codigo = variable = $(this).attr('id');
        addCliente(codigo);
        $.mobile.changePage("#clienteDetalle", {changeHash: true});
        //$.mobile.changePage($('#clienteDetalle'), {transition: "slide",changeHash: true});
        //$.mobile.pageContainer.pagecontainer("change", "#clienteDetalle");
    }); 
})

$(document).on("pageshow", "#CarteraCte", function() {
    TraerCartera();
});

$(document).on("pageshow", "#AutRemota", function() {
    $('#AutRemota_btnAutRemota').removeClass('ui-disabled');
    usuarioAut = ""
    var url = bmsServer + "/api/General/GetUsuariosAutRemota",
        html = "",
        success = function(data) {
            if (data.length === 0) { 
                alertBox("No hay usuarios para autorizar la operación.", null, "BMS Móvil", "OK");
                return;
            } else { 
                html +="<legend>Usuarios:</legend>"
                $.each(data, function(i, val) {
                    html +="<input type='radio' name='radio-usuario' id='" + val.usuario + "' value='" + val.nombre + "'><label for='" + val.usuario + "'>" + val.nombre + "</label>"
                });                 

                $('#AutRemota_Usuarios').empty();
                $('#AutRemota_Usuarios').html(html);
                $('#AutRemota_Usuarios').trigger('create');
            }
        };
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {
            "cliente": bmsCliente, "prod": bmsProducto, "unidad": bmsUnidad, "cant": bmsCantidad, "precio": bmsPrecio, "condpago":bmsCondPago, "usuario":bmsUser, "estab": bmsEstab
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           }); 
});

function actualizaTotalesPedido() {
    var length = bmsLineaDetalle.length,
        obj = null,
        i;
    bmsPedImporte = 0;
    bmsPedIva = 0;
    bmsPedTotal = 0; 
    if (length !== 0) {
        for (i = 0; i < length; i++) {
            obj = bmsLineaDetalle[i];
            bmsPedImporte += parseFloat(obj.importe);
            bmsPedIva += parseFloat(obj.iva);
            bmsPedTotal += parseFloat(obj.total);
        }    
    }
    if (length === 0) {
        bmsPedImporte = 0;
        bmsPedIva = 0;
        bmsPedTotal = 0;                        
    }
    document.getElementById("pedido_txtImporte").value = numeral(bmsPedImporte).format('$0,0.00');
    document.getElementById("pedido_txtIva").value = numeral(bmsPedIva).format('$0,0.00');
    document.getElementById("pedido_txtTotal").value = numeral(bmsPedTotal).format('$0,0.00');

    $('#pedidoDetalle_totalImporte').text(numeral(bmsPedImporte).format('$0,0.00'));
    $('#pedidoDetalle_totalIva').text(numeral(bmsPedIva).format('$0,0.00'));
    $('#pedidoDetalle_Total').text(numeral(bmsPedTotal).format('$0,0.00'));
    logGlobal();              
}

function actualizaTotalesProducto(cant, precio) {
    var actualizaPrecio = false;
    bmsProdImporte = 0;
    bmsProdIva = 0;
    bmsProdTotal = 0;
    var div = 1;
    if (cant === 0) {
        cant = 1;
    }
    if (bmsUnidad ==='P') {
        div = prodObj.contenido;
    }
    if (precio === 0) {
        precio = prodObj.precioUC;
        if (bmsUnidad ==='P') {
            precio = prodObj.precioUA;
        }
        precio = precio * (1 + prodObj.porcentajeIVA / 100);
        actualizaPrecio = true;
    }
    bmsCantidad = cant;
    bmsPrecio = precio.toFixed(2);
    bmsPeso = prodObj.peso * cant / div;
    bmsVolumen = prodObj.volumen * cant / div;
    bmsProdTotal = bmsPrecio * cant;
    bmsProdImporte = bmsProdTotal / (1 + prodObj.porcentajeIVA / 100)
    bmsProdImporte = bmsProdImporte.toFixed(2);
    bmsProdIva = bmsProdTotal - bmsProdImporte;
    if (actualizaPrecio) {
        document.getElementById("productos_txtPrecioUni").value = bmsPrecio;
    }
    document.getElementById("productos_txtTotal").value = numeral(bmsProdTotal).format('$0,0.00');
    document.getElementById("productos_txtIva").value = numeral(bmsProdIva).format('$0,0.00');
    document.getElementById("productos_txtImporte").value = numeral(bmsProdImporte).format('$0,0.00');    
}

function actualizaTotalesProductosEditar(cant, precio) {
    var actualizaPrecio = false;
    bmsProdImporte = 0;
    bmsProdIva = 0;
    bmsProdTotal = 0;
   
    var div = 1;
    if (cant === 0) {
        cant = 1;
    }
    if (bmsUnidad ==='P') {
        div = prodObj.contenido;
    }
    if (precio === 0) {
        precio = prodObj.precioUC;
        if (bmsUnidad ==='P') {
            precio = prodObj.precioUA;
        }
        precio = precio * (1 + prodObj.porcentajeIVA / 100);
        actualizaPrecio = true;
    }
    precio = precio.toFixed(2);
    if (precio !== bmsPrecio) {
        prodAutorizado = "";   
    }
    bmsPeso = prodObj.peso * cant / div;
    bmsVolumen = prodObj.volumen * cant / div;
    bmsCantidad = cant;
    bmsPrecio = precio;
    bmsProdTotal = bmsPrecio * cant;
    bmsProdImporte = bmsProdTotal / (1 + prodObj.porcentajeIVA / 100)
    bmsProdImporte = bmsProdImporte.toFixed(2);
    bmsProdIva = bmsProdTotal - bmsProdImporte;
    if (actualizaPrecio) {
        document.getElementById("productosEditar_txtPrecioUni").value = bmsPrecio;
    }
    document.getElementById("productosEditar_txtImporte").value = numeral(bmsProdImporte).format('$0,0.00');
    document.getElementById("productosEditar_txtIva").value = numeral(bmsProdIva).format('$0,0.00');
    document.getElementById("productosEditar_txtTotal").value = numeral(bmsProdTotal).format('$0,0.00');
}

function modificaDetalle () {
    msgAut = "";
    if (prodAutorizado === "SI") {
        bmsLineaDetalle[iProdObjModif].cantidad = bmsCantidad;
        bmsLineaDetalle[iProdObjModif].unidad = bmsUnidad;
        bmsLineaDetalle[iProdObjModif].unidadNombre = bmsUnidadNombre;
        bmsLineaDetalle[iProdObjModif].peso = bmsPeso;
        bmsLineaDetalle[iProdObjModif].volumen = bmsVolumen;
        bmsLineaDetalle[iProdObjModif].precio = bmsPrecio;
        bmsLineaDetalle[iProdObjModif].importe = bmsProdImporte;
        bmsLineaDetalle[iProdObjModif].iva = bmsProdIva;
        bmsLineaDetalle[iProdObjModif].total = bmsProdTotal;
        bmsLineaDetalle[iProdObjModif].prodEstab = bmsProdEstab;
        bmsLineaDetalle[iProdObjModif].prodEstabName = bmsEstabName;
        bmsLineaDetalle[iProdObjModif].fichas = bmsFichas;
        bmsLineaDetalle[iProdObjModif].comentario = creaComentario();
        bmsLineaDetalle[iProdObjModif].prodAutorizado = prodAutorizado;
        logGlobal();
    
        actualizaTotalesPedido();
        limpiaProducto();
        alertBox("Producto modificado correctamente.", null, "BMS Móvil", "OK");
        //alert("Producto modificado correctamente.");

        $.mobile.changePage("#pedido", {changeHash: true});
    }
    var url = bmsServer + "/api/Productos/GetVerificaMargen",
        success = function(data) {
            if (data !== "") {
                msgAut = data;
                prodAutorizado = "NO"
                valido = false;
                navigator.notification.confirm(
                    JSON.stringify(data), // message
                    onConfirmAutRemota, // callback to invoke with index of button pressed
                    "Confirmar acción.", // title
                    ["OK","Autorizacion remota"]);
                return;
            } else {
                bmsLineaDetalle[iProdObjModif].cantidad = bmsCantidad;
                bmsLineaDetalle[iProdObjModif].unidad = bmsUnidad;
                bmsLineaDetalle[iProdObjModif].unidadNombre = bmsUnidadNombre;
                bmsLineaDetalle[iProdObjModif].peso = bmsPeso;
                bmsLineaDetalle[iProdObjModif].volumen = bmsVolumen;
                bmsLineaDetalle[iProdObjModif].precio = bmsPrecio;
                bmsLineaDetalle[iProdObjModif].importe = bmsProdImporte;
                bmsLineaDetalle[iProdObjModif].iva = bmsProdIva;
                bmsLineaDetalle[iProdObjModif].total = bmsProdTotal;
                bmsLineaDetalle[iProdObjModif].prodEstab = bmsProdEstab;
                bmsLineaDetalle[iProdObjModif].prodEstabName = bmsEstabName;
                bmsLineaDetalle[iProdObjModif].fichas = bmsFichas;
                bmsLineaDetalle[iProdObjModif].comentario = creaComentario();
                bmsLineaDetalle[iProdObjModif].prodAutorizado = prodAutorizado;
                logGlobal();
    
                actualizaTotalesPedido();
                limpiaProducto();
                alertBox("Producto modificado correctamente.", null, "BMS Móvil", "OK");
                //alert("Producto modificado correctamente.");

                $.mobile.changePage("#pedido", {changeHash: true});
            }
        };
    //Llamada al web service GetVerificaMargen
    $.ajax({
               type: 'get',
               async: false,
               url: url,
               data: {"usuario": bmsUser, "cliente": bmsCliente, "estab": bmsEstab, "prod": prodObj.codigo, "unidad": bmsUnidad, "precio": bmsPrecio},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
                   return false;
               }
           });
}

function inicio() {        
    nuevoPedido();
    $('#selector_estab_listaEstab').empty();
    bmsEstab = "";
    bmsTipo = "";
    document.getElementById("text1").value = '';
    document.getElementById("text2").value = '';
    $('#text1').focus();
}

function iniciaPedido() {
    document.getElementById("pedido_dtpFecha").valueAsDate = bmsFecha;
    document.getElementById("pedido_txtImporte").value = numeral(bmsPedImporte).format('$0,0.00');
    document.getElementById("pedido_txtIva").value = numeral(bmsPedIva).format('$0,0.00');
    document.getElementById("pedido_txtTotal").value = numeral(bmsPedTotal).format('$0,0.00');
}

function llenaSelect(codigoUsuario) { //Recibe un codigo de usuario, consume el ws GetEstabs y llena un Select 
    var url = bmsServer + "/api/sesion/GetEstabs",
         
        html = '<option value="' + '-1' + '">' + "Seleccione..." + '</option>',
        success = function(data) {
            if (data.codigo !== "") {
                $('#selector_estab_listaEstab').empty();
                //alert("Llenar combo.");
                //console.log(data);
                $.each(data, function(i, val) {
                    html += '<option value="' + val.codigo + '">' + val.nombre + '</option>';
                });
                $('#selector_estab_listaEstab').append(html);
                $("#selector_estab_listaEstab").selectmenu('refresh', true);
            }
        };
    //Llamada al web service GetEstabs 
    $.ajax({
               type: 'get',
               url: url,
               data: {
            "usuario": codigoUsuario
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
    llenaCondDistrib();
}

function llenaCondDistrib() {
    var url = bmsServer + "/api/General/GetCondDistrib",
         
        html = '<option value="' + '-1' + '" data-multiestab="True">' + "Seleccione..." + '</option>',
        success = function(data) {
            if (data[0] !== null) {
                //if (tienePermiso("ExigeCD")) {
                $('#pedido_CondDistrib').empty();
                //alert("Llenar combo.");
                //console.log(data);
                $.each(data, function(i, val) {
                    html += '<option value="' + val.codigo + '" data-multiestab="' + val.multiestab + '">' + val.nombre + '</option>';
                });
                $('#pedido_CondDistrib').selectmenu();
                $('#pedido_CondDistrib').append(html);
                $("#pedido_CondDistrib").selectmenu('refresh', true);
                //    }
            }
        };
    //Llamada al web service GetEstabs 
    $.ajax({
               type: 'get',
               url: url,
               data: {},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}

function incluyeProducto() {
    msgAut = "";
    if (prodAutorizado === "SI") {
        var productoNuevo = new producto(prodObj.codigo, prodObj.descripcion, bmsUnidad, bmsUnidadNombre, bmsCantidad
                                         , bmsPeso, bmsVolumen, bmsPrecio, bmsProdImporte
                                         , bmsProdIva, bmsProdTotal, bmsPrecio, bmsProdEstab
                                         , bmsEstabName, bmsFichas, bmsFichaTec, comentario, prodAutorizado);
        bmsLineaDetalle.push(productoNuevo);
        logGlobal();
        actualizaTotalesPedido();
        limpiaProducto();
        alertBox("Producto agregado correctamente.", null, "BMS Móvil", "OK");
        $('#productos_txtProducto').focus();
        return;
    }
    var comentario = creaComentario(),
        url = bmsServer + "/api/Productos/GetVerificaMargen",
        success = function(data) {
            if (data !== "") {
                msgAut = data;
                prodAutorizado = "NO"
                valido = false;
                navigator.notification.confirm(
                    JSON.stringify(data), // message
                    onConfirmAutRemota, // callback to invoke with index of button pressed
                    "Confirmar acción.", // title
                    ["OK","Autorizacion remota"]);
                return;
            } else {
                //function producto(codigo, descripcion, unidad, unidadAbrev, cantidad, peso, volumen, precio, importe, iva, total
                //, precioOriginal, prodEstab, prodEstabName, fichas, fichatec, comentario)
                var productoNuevo = new producto(prodObj.codigo, prodObj.descripcion, bmsUnidad, bmsUnidadNombre, bmsCantidad
                                                 , bmsPeso, bmsVolumen, bmsPrecio, bmsProdImporte
                                                 , bmsProdIva, bmsProdTotal, bmsPrecio, bmsProdEstab
                                                 , bmsEstabName, bmsFichas, bmsFichaTec, comentario, prodAutorizado);
                bmsLineaDetalle.push(productoNuevo);
                logGlobal();
                actualizaTotalesPedido();
                limpiaProducto();
                alertBox("Producto agregado correctamente.", null, "BMS Móvil", "OK");
                $('#productos_txtProducto').focus();
            }
        };
    //Llamada al web service GetVerificaMargen
    $.ajax({
               type: 'get',
               async: false,
               url: url,
               data: {"usuario": bmsUser, "cliente": bmsCliente, "estab": bmsEstab, "prod": prodObj.codigo, "unidad": bmsUnidad, "precio": bmsPrecio},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
                   return false;
               }
           });
}

function submit_login() {
    var username = $("#text1").val(),
        password = $("#text2").val(),
        estab = "1",
        url = bmsServer + "/api/sesion/GetUsuario",
        success = function(data) {
            if (data.codigo === "") {
                $('#modal').hide();
                alertBox("No se pudo iniciar sesion, por favor verifique sus datos.", null, "BMS Móvil", "OK");
                //alert("No se pudo iniciar sesion, por favor verifique sus datos.");
                inicio();
                return;
            }  
            if (data.codigo !== "") {
                $('#modal').hide();
                bmsUserName = data.nombre;
                alertBox("Bienvenido " + data.nombre, null, "BMS Móvil", "OK");
                //alert("Bienvenido " + data.nombre);
                bmsUser = data.codigo; //Variable Global BMS
                console.log('***DEBUGGING LOG - [Page: Login] Codigo usuario guardado: ' + data.codigo);
                $.mobile.changePage('#selector_estab', {changeHash: true});
                llenaSelect(data.codigo);
                //$('#establecimientos').css('visibility','visible');
            }
        };
    console.log('***DEBUGGING LOG - [Page: Login] [Data: username = ' + username +
                '] [Data: password = ' + password + '\n' +
                '] [Data: estab = ' + estab + '\n' +
                '] [Data: url = ' + url);             
     
    //Llamada al web service GetUsuario 
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {
            "usuario": username.trim(),
            "clave": password.trim()
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alertBox("No se pudo conectar. Verifique los datos de conexión.", null, "BMS Móvil", "OK");
               }
           });
}

function validaCabeceroDoc() {
    var b = true;
    if (bmsUser === "" || bmsUser === "undefined" || bmsUser === null) {
        alertBox("Usuario no válido.", null, "BMS Móvil", "OK");
        b = false;
        return b;
    }
    if (bmsEstab === "" || bmsEstab === "undefined" || bmsEstab === null) {
        alertBox("Establecimiento no válido.", null, "BMS Móvil", "OK");
        b = false;
        return b;
    }
    if (bmsTipo !== "pedido") {
        alertBox("Tipo de docuemento no válido.", null, "BMS Móvil", "OK");
        b = false;
        return b;
    }
    if (bmsCliente === "" || bmsCliente === "undefined" || bmsCliente === null) {
        alertBox("Cliente no válido.", null, "BMS Móvil", "OK");
        b = false;
        return b;
    }
    if (bmsFecha === "" || bmsFecha === "undefined" || bmsFecha === null) {
        alertBox("Fecha no válida.", null, "BMS Móvil", "OK");
        b = false;
        return b;
    }
    /*if (bmsSucursal === "" || bmsSucursal === "undefined" || bmsSucursal === null ) {
    alertBox("No selecciono una sucursal.", "cbDefault()", "BMS Móvil", "OK");
    b = false;
    return b;
    }*/ 
    return b;
}

function probarConexion() {
    var url = bmsServer + "/api/General/GetProbarConexion",
     
        success = function(data) {
            if (data === true) {
                alertBox("La conexión se estableció correctamente.", null, "BMS Móvil", "OK");
                //alert("La conexión se estableció correctamente.");
                AddValueToDB();
            }
        };

    //Llamada al web service 
    $.ajax({
               timeout: 10000,
               type: 'get',
               url: url,
               data: {},
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alertBox("No se pudo conectar. Verifique los datos de conexión.", null, "BMS Móvil", "OK");
               }
           });
}

function booleano(myString) {
    switch (myString) {
        case 'True':
            return true;
        case 'False':
            return false;
        default:
            return false;   
    }
}

function getFecha (fecha) {
    var today = fecha;
    //DEBUG
    //alertBox("Llegamos a getFecha(). fecha = " +today, null, "BMS Móvil", "OK");
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    } 
    today = yyyy + '/' + mm + '/' + dd;
    //DEBUG
    //alertBox("A punto de terminar getFecha().  return value today = " +today, null, "BMS Móvil", "OK");

    return today;
}

function convertToSlash(string) {
    var response = string.replace(/-/g, "/");
    return response;
}

//Funciones Básicas
window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

$.fn.clearForm = function() {
    return this.each(function() {
        var type = this.type,
            tag = this.tagName.toLowerCase();
        if (tag === 'form')
            return $(':input', this).clearForm();
        if (type === 'text' || type === 'password' || tag === 'textarea')
            this.value = '';
        else if (type === 'checkbox' || type === 'radio')
            this.checked = false;
        else if (tag === 'select')
            this.selectedIndex = -1;
    });
};

$(document).ready("pageinit", "#config", function() {
    queryDB();
});

function seleccionaEstab() {
    bmsEstab = document.getElementById("selector_estab_listaEstab").value;
    bmsEstabName = document.getElementById('selector_estab_listaEstab').options[document.getElementById('selector_estab_listaEstab').selectedIndex].text;
    estabOriginalCod = bmsEstab;
    estabOriginalNom = bmsEstabName;
    console.log('***DEBUGGING LOG - [Page: selector_estab] [Data: bmsEstab = ' + bmsEstab +
                ']');
    //showNotificationBar("Acciones al seleccionar un elemento");
}

function seleccionaSucursal() {
    bmsSucursal = document.getElementById("clienteDetalle_listaSucursales").value;
    console.log('***DEBUGGING LOG - [Page: selector_sucursales] [Data: bmsSucursal = ' + bmsSucursal +
                ']');
    //showNotificationBar("Acciones al seleccionar un elemento");
}

function seleccionaCondicion() {
    bmsCondPago = document.getElementById("clienteDetalle_listaCondiciones").value;
    console.log('***DEBUGGING LOG - [Page: selector_Condiciones] [Data: bmsCondPago = ' + bmsCondPago +
                ']');
    //showNotificationBar("Acciones al seleccionar un elemento");
}

function seleccionaPedido() {
    bmsTipo = $(this).attr('data-name');
    bmsTipo = document.getElementById("selectorTipo_listaTipo").index;
    console.log('***DEBUGGING LOG - [Page: selectorTipo] [Data: bmsTipo = ' + bmsTipo +
                ']');
}

function seleccionaUnidad(modif) {
    var cant = 0,
        precio = 0;
    if (modif) {
        bmsUnidad = $("#productosEditar_listaUnidad").val();
        bmsUnidadNombre = $("#productosEditar_listaUnidad").find(":selected").text();
        ObtenerPrecio($('#productosEditar_txtPrecioUni'), $('#productosEditar_txtCantidad'), modif);
        cant = parseFloat($('#productosEditar_txtCantidad').val());
        precio = parseFloat($('#productosEditar_txtPrecioUni').val());
        actualizaTotalesProductosEditar(cant, precio);
        return;
    }
    bmsUnidad = $("#productos_listaUnidad").val();
    bmsUnidadNombre = $("#productos_listaUnidad").find(":selected").text();
    ObtenerPrecio($('#productos_txtPrecioUni'), $('#productos_txtCantidad'), modif);
    cant = parseFloat($('#productos_txtCantidad').val());
    precio = parseFloat($('#productos_txtPrecioUni').val());
    actualizaTotalesProducto(cant, precio);
}

function seleccionaCondDistrib() {
    bmsCondDistrib = document.getElementById("pedido_CondDistrib").value;
    bmsMultiestab = $("pedido_CondDistrib").data("data-multiestab");
}
 
function onConfirmSalir(button) {
    if (button === 2) {
        console.log("Botón presionado index: " + button);
        inicio();
        $.mobile.changePage('#Login', {changeHash: true});
    }
}

function salir() {
    navigator.notification.confirm(
        "Está a punto de terminar su sesión, desea continuar?", // message
        onConfirmSalir, // callback to invoke with index of button pressed
        "Confirmar acción.", // title
        "Cancelar,OK");       // buttonLabels
    //var answer = confirm("Está a punto de terminar su sesión, desea continuar?");
}

function onConfirmSeleccionarCliente(button) {
    if (button === 2) {
        console.log("Botón presionado index: " + button);
        //inicio();
        $.mobile.changePage('#clienteDetalle', {changeHash: true});
    }
}
function onConfirmAutRemota(button) {
    if (button === 2) {
        $.mobile.changePage('#AutRemota', {changeHash: true});
    }
}

function onConfirmGuardaPedido(button) {
    if (button === 2) {
        if (validaCabeceroDoc()) {
            if (bmsLineaDetalle.length === 0) { //Se valida el detalle
                alertBox("El pedido está vacío. Necesita añadir productos para guardar un pedido.", null, "BMS Móvil", "OK");
                return;
            }

            var i,
                obj = null,
                length = bmsLineaDetalle.length,
                bmsNotas = document.getElementById("pedido_txtNotas").value,
                fecha = $("#pedido_dtpFecha").val(), 
                fObj = new Date(convertToSlash(fecha)),
                today = getFecha(fObj);
            pedLineas = [];
            for (i = 0; i < length; i++) {
                obj = bmsLineaDetalle[i];

                pedProd = new pedidoProd(obj.codigo, obj.cantidad, obj.total, obj.unidad, obj.peso, obj.prodEstab, obj.comentario);

                pedLineas.push(pedProd);
            }
            //Crear los objetos para mandarlos por el WS
            //Si se enviaron regresar true;
            //pedido = new pedidoPost(bmsCliente, bmsEstab, bmsFecha, bmsNotas, bmsSucursal, bmsUser, pedLineas);
            //function pedido (cliente, establecimiento, fecha, notas, sucursal, usuario, productos)
                    
            var url = bmsServer + "/api/General/PostGuardar",
                msgAut = "",
                success = function(data) {
                    if (data[0] !== "") {
                        msgAut = "Pedido guardado correctamente \n Folio guardado: " + JSON.stringify(data[0]);
                        if (data[1]!=="")
                            {
                                msgAut ="\n Pedido no autorizado: " + JSON.stringify(data[1]);
                            }
                        alertBox(msgAut, null, "BMS Móvil", "OK");
                        pedidoGuardado = true;
                        nuevoPedido();
                        $.mobile.changePage('#selectorTipo', {changeHash: true});
                        return;
                    } else {
                        alertBox("Pedido no guardado. ERROR: " + JSON.stringify(data[1]), null, "BMS Móvil", "OK");
                    }
                };

            //Llamada al web service 
            $.ajax({
                       timeout: 100000,
                       type: 'POST',
                       url: url,
                       data: {"cliente":bmsCliente, "CondDistrib": bmsCondDistrib, "CondPago": bmsCondPago, "estab":bmsEstab,"fecha":today,"notas":bmsNotas,"sucursal":bmsSucursal,"user":bmsUser,"productos":pedLineas},
                       dataType: "json",
                       crossDomain: false,
                       cache: false,
                       success: success,
                       beforeSend: function() {
                           $('#modal').show();
                       },
                       complete: function() {
                           $('#modal').hide();
                       },
                       error: function(jqXHR, textStatus, errorThrown) {
                           alert(errorThrown);
                       }
                   });
        }
    }
}


function onConfirmGuardaCotiz(button) {
    if (button === 2) {
        if (validaCabeceroDoc()) {
            if (bmsLineaDetalle.length === 0) { //Se valida el detalle
                alertBox("Necesita añadir productos para guardar una cotización.", null, "BMS Móvil", "OK");
                return;
            }

            var i,
                obj = null,
                length = bmsLineaDetalle.length,
                bmsNotas = document.getElementById("pedido_txtNotas").value,
                fecha = $("#pedido_dtpFecha").val(), 
                fObj = new Date(convertToSlash(fecha)),
                today = getFecha(fObj);
            pedLineas = [];
            for (i = 0; i < length; i++) {
                obj = bmsLineaDetalle[i];

                pedProd = new pedidoProd(obj.codigo, obj.cantidad, obj.total, obj.unidad, obj.peso, obj.prodEstab, obj.comentario);

                pedLineas.push(pedProd);
            }
            //Crear los objetos para mandarlos por el WS
            //Si se enviaron regresar true;
            //pedido = new pedidoPost(bmsCliente, bmsEstab, bmsFecha, bmsNotas, bmsSucursal, bmsUser, pedLineas);
            //function pedido (cliente, establecimiento, fecha, notas, sucursal, usuario, productos)
                    
            var url = bmsServer + "/api/General/PostGuardarCotiz",
                msgAut = "",
                success = function(data) {
                    if (data[0] !== "") {
                        msgAut = "Cotización guardada correctamente \n Folio guardado: " + JSON.stringify(data[0]);
                        alertBox(msgAut, null, "BMS Móvil", "OK");
                        pedidoGuardado = true;
                        nuevoPedido();
                        $.mobile.changePage('#selectorTipo', {changeHash: true});
                        return;
                    } else {
                        alertBox("Pedido no guardado. ERROR: " + JSON.stringify(data[1]), null, "BMS Móvil", "OK");
                    }
                };

            //Llamada al web service 
            $.ajax({
                       timeout: 100000,
                       type: 'POST',
                       url: url,
                       data: {"cliente":bmsCliente, "CondDistrib": bmsCondDistrib, "CondPago": bmsCondPago, "estab":bmsEstab,"fecha":today,"notas":bmsNotas,"sucursal":bmsSucursal,"user":bmsUser,"productos":pedLineas},
                       dataType: "json",
                       crossDomain: false,
                       cache: false,
                       success: success,
                       beforeSend: function() {
                           $('#modal').show();
                       },
                       complete: function() {
                           $('#modal').hide();
                       },
                       error: function(jqXHR, textStatus, errorThrown) {
                           alert(errorThrown);
                       }
                   });
        }
    }
}

function onConfirmBtnAtras(button) {
    if (button === 2) {
        $.mobile.changePage('#selectorTipo', {changeHash: true});
        nuevoPedido();         
        logGlobal();
    }
}

function onConfirmBtnCancelaPedido(button) {
    if (button === 2) {
        nuevoPedido();         
        logGlobal();
        $.mobile.changePage('#selectorTipo', {changeHash: true});
    }
}

function onConfirmBtnCancelaProducto(button) {
    if (button === 2) {
        limpiaProducto();
    }
}

function onConfirmTapHold(button, i, listitem) {
    switch (button) {
        case 1:
            break;
        case 2:
            $.mobile.changePage('#productosEditar', {changeHash: true});
            modificaProducto(i);
            Editando = true;
            break;
        case 3:
            var eliminado = bmsLineaDetalle.splice(i, 1);
            alertBox("Producto eliminado: " + eliminado[0].descripcion + " Cant. " + eliminado[0].cantidad + " Importe. " + numeral(eliminado[0].importe).format('$0,0.00'), null, "BMS Móvil", "OK");
            listitem.remove();
            actualizaTotalesPedido();
            // ...the list will be refreshed and the temporary class for border styling removed
            $("#list").listview("refresh").find(".ui-li.border").removeClass("border");
            break;
        default:
            break;  
    }
}

function onConfirmBtnBorraTodos(button) {
    if (button === 2) {
        bmsLineaDetalle = [];

        $('#list').empty();
        $("#list").listview("refresh");
        actualizaTotalesPedido();

        alertBox("Se han eliminado todos los productos del pedido.", null, "BMS Móvil", "OK");
        $.mobile.changePage($('#pedido'), {changeHash: true});
    }
}

function mostrarFichasTecnicas(prod, pagina) {
    if (bmsFichaTec==="") {
        alertBox("El producto no maneja ficha técnica.", null, "BMS Móvil", "OK");
        return;
    }
    if (prod === "") {
        alertBox("No ha seleccionador un producto.", null, "BMS Móvil", "OK");
        return;
    }
    var url = bmsServer + "/api/Productos/GetFichasTec",
        html = "",
        obj = {},
        success = function(data) {
            if (data[0] !== null) {
                var ficha = "@#%";
                $.each(data, function(i, val) {
                    obj = val;
                    if (obj.dato.trim()!==ficha.trim()) {
                        ficha = obj.dato.trim();
                        if (html !== "") {
                            html +="</fieldset>";
                        } else {
                            html +="<fieldset data-role='controlgroup' id ='" + obj.dato.trim() + "'> <legend>" + obj.dato.trim() + "</legend>";
                        }
                    }
                    html += "<input type='checkbox' id= 'chk_" + i + "' class='custom'/><label for='chk_" + i + "'>" + obj.valor.trim() + "</label>"; 
                });
            }
            if (html !=="") {
                html +="</fieldset>";
            }
            $.mobile.changePage('#fichasTec', {changeHash: true});
            $('#fichasTec_list').empty();
            $('#fichasTec_list').append(html);
            $("input[type='checkbox']").checkboxradio();
            $("input[type='checkbox']").checkboxradio("refresh");
            $("#fichasTec_list").trigger('create')
            document.getElementById("fichasTec_pagina").value = pagina;
        };
    
    $.ajax({
               timeout: 1000000,
               type: 'get',
               url: url,
               data: {
            "estab": bmsProdEstab,
            "producto": bmsProducto,
            "fichadato": bmsFichaTec
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });  		
}
    
function seleccionarFichasTec() {
    try {
        bmsFichas = []
        $('#fichasTec input[type=checkbox]').each(function() {
            if ($(this).is(':checked')) {
                var valor = $(this).next("label").text();
                var dato = $(this).parents("fieldset").attr("id");
                //fichaTecnica(dato, valor)
                var ficha = new fichaTecnica(dato, valor);
                bmsFichas.push(ficha)
            }
        });
        $.mobile.changePage("#fichasTec_pagina", {changeHash: true});
    } catch (err) {
        console.log(err.message);
    }
}

function creaComentario() {
    var comentario = "",
        dato = "@#$",
        aux = "";
    bmsFichas.forEach(function(element, index, array) {
        if (dato.trim() !== element.dato.trim()) {
            if (aux !== "") {
                if (comentario !=="") {
                    comentario +=";";
                }
                comentario += dato + " " + aux;
                aux = "";
            }
            dato = element.dato.trim();
        }
        if (aux.trim() !== "") {
            aux += ","
        }
        aux += element.valor.trim();
    });
    if (aux !=="") {
        if (comentario !=="") {
            comentario +=";";
        }
        comentario += dato + " " + aux; 
    }
    return comentario;
}
function ObtenerPrecio(txtPrecio, txtCant, modif) {
    var cant = $("#productos_txtCantidad").val();
    if (modif) {
        cant = $("#productosEditar_txtCantidad").val();
    }
    var url = bmsServer + "/api/productos/GetPrecio",
        success = function(data) {
            if (data !== 0) {
                txtPrecio.val(data)
                if (modif) {
                    actualizaTotalesProductosEditar(cant, data);
                }else {
                    actualizaTotalesProducto(cant, data);
                }
            }
        };
    //Llamada al web service GetEstabs 
    $.ajax({
               type: 'get',
               url: url,
               data: {
            "producto": bmsProducto,
            "estab": bmsEstab,
            "cliente": bmsCliente,
            "unidad": bmsUnidad,
            "cantidad": cant
        },
               dataType: "jsonp",
               crossDomain: true,
               cache: false,
               success: success,
               beforeSend: function() {
                   $('#modal').show();
               },
               complete: function() {
                   $('#modal').hide();
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   alert(errorThrown);
               }
           });
}