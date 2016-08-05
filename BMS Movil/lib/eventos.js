$(document).bind('mobileinit', function() {
    $.mobile.defaultPageTransition = "none";
    $.fn.animationComplete = function(callback) {
        if ($.support.cssTransitions) {
            var superfy = "WebKitTransitionEvent" in window ? "webkitAnimationEnd" : "animationend";
            return $(this).one(superfy, callback);
        } else {
            setTimeout(callback, 0);
            return $(this);
        }
    };
})
$(document).on('pageinit', '#Login', function() {       
    $("#Login_btnConfig").on("click", function(e) {
        e.preventDefault();
        queryDB();
        $.mobile.changePage('#config', {changeHash: true});
    });
    
    $("#Login_btnIniciar").click(function(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        submit_login();
    });        
    
    $('#text1').on('keypress', function(e) { 
        var input = $(this).val();
        if (e.keyCode === 13) {
            if (input !== "") {
                $('#text2').focus();
            }
        }            
    });   
    $('#text2').on('keypress', function(e) { 
        var input = $(this).val();
        if (e.keyCode === 13) {
            if (input !== "") {
                if (!validateForm()) {
                    return;
                }
                submit_login();
            }
        }            
    });
});

$(document).on('pageinit', '#config', function() {       
    $('#config_servidor').on('keypress', function(e) { 
        var input = $(this).val();
        if (e.keyCode === 13) {
            if (input !== "") {
                probarConexion();
            }
        }             
    });
     
    $('#config_btnProbar').click(function(e) {
        e.preventDefault();
        bmsServer = $('#config_servidor').val();
        if (bmsServer === "") {
            alertBox("Para probar la conexión ingrese un servidor válido.", null, "BMS Móvil", "OK");
            //alert("Para probar la conexión ingrese un servidor válido.");
            return;
        }
        probarConexion();
    });
    
    $("#config_btnGuardar").on("click", function(e) {
        e.preventDefault();
        AddValueToDB();
    });
    
    $("#config_btnCerrar").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#Login', {changeHash: true});
    });
});

$(document).on('pageinit', '#selector_estab', function() {       
    $('#selector_estab_BtnSalir').click(function(e) {
        e.preventDefault();
        salir();     
    });
    $('#selector_estab_BtnContinuar').click(function(e) {
        e.preventDefault();
        if (bmsEstab === -1 || bmsEstab === null || bmsEstab === "") {
            alertBox("Seleccione un establecimiento para continuar", null, "BMS Móvil", "OK");
            //alert("Seleccione un establecimiento para continuar");
            return;
        }

        // Llamada al webservice GetParametros para traer los parametros de la aplicación
        getParametros();

        $.mobile.changePage('#selectorTipo', {changeHash: true});
    });
    $('#selector_estab_listaEstab').change(function(e) {
        e.preventDefault();
        seleccionaEstab();
    });
    $('#selector_estab_listaEstab').on('focus', function(e) {
        e.preventDefault();
        this.selectedindex = -1;
    });
});   

$(document).on('pageinit', '#selectorTipo', function() {    
    $("#selectorTipo_btnPedido").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
    
    $("#selectorTipo_btnCobranza").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#cobranza', {changeHash: true});
    });
    
    $("#selectorTipo_btnReporte").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#reporte', {changeHash: true});
    });
    $("#selectorTipo_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#selector_estab', {changeHash: true});
    });
    $('#selectorTipo_listaTipo').children('li').click(function(e) {
        e.preventDefault();
        bmsTipo = $(this).attr('data-name');
        if (bmsTipo === "pedido") {
            iniciaPedido();
        }          
        console.log('***DEBUGGING LOG - [Page: selectorTipo] [Data: bmsTipo = ' + bmsTipo +
                    ']');
    });
});  

$(document).on('pageinit', '#pedido', function() {    
    $("#pedido_btnCliente").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#clienteDetalle', {changeHash: true});
    });
    $('#pedido_CondDistrib').change(function(e) {
        e.preventDefault();
        var selected = $(this).find('option:selected');
        bmsCondDistrib = selected.val();
        bmsMultiestab = selected.data('multiestab');
    });  
    $("#pedido_btnDetalle").click(function(e) {
        e.preventDefault();
        if (bmsLineaDetalle.length === 0) {
            alertBox("No se han agregado productos", null, "BMS Móvil", "OK");
            //alert("No se han agregado productos"); 
            return;
        }
        $.mobile.changePage('#pedidoDetalle', {changeHash: true});
    });
    $('#Pedido_btnAgregarProducto').click(function(e) {
        e.preventDefault();
        if (tienePermiso("ExigeCD")) {
            if (bmsCondDistrib === "" || bmsCondDistrib ==="-1") {
                alertBox("Necesita seleccionar una condición de distribución para continuar.", null, "BMS Móvil", "OK");
                return;
            }
        }
        if (bmsCliente !== "") {
            Editando = false;
            $.mobile.changePage('#productos', {changeHash: true});
        }
        if (bmsCliente === "") {
            navigator.notification.confirm(
                "Primero debe seleccionar un cliente. Desea hacerlo ahora?", // message
                onConfirmSeleccionarCliente, // callback to invoke with index of button pressed
                "Confirmar acción.", // title
                "Cancelar,OK");       // buttonLabels
            //selectCte = confirm("Primero debe seleccionar un cliente. Desea hacerlo ahora?");
        }
    });

    $('#Pedido_btnGuardaPedido').click(function(e) {
        e.preventDefault();
        if (tienePermiso("ExigeCD")) {
            if (bmsCondDistrib === "" || bmsCondDistrib ==="-1") {
                alertBox("Necesita seleccionar una condición de distribución para continuar.", null, "BMS Móvil", "OK");
                return;
            }
        }
        navigator.notification.confirm(
            "Está a punto de guardar el pedido, desea continuar?", // message
            onConfirmGuardaPedido, // callback to invoke with index of button pressed
            "Confirmar acción.", // title
            "Cancelar,OK");       // buttonLabels
    });
    
    $('#Pedido_btnGuardaCotiz').click(function(e) {
        e.preventDefault();
        if (tienePermiso("ExigeCD")) {
            if (bmsCondDistrib === "" || bmsCondDistrib ==="-1") {
                alertBox("Necesita seleccionar una condición de distribución para continuar.", null, "BMS Móvil", "OK");
                return;
            }
        }
        navigator.notification.confirm(
            "Está a punto de guardar el pedido, desea continuar?", // message
            onConfirmGuardaCotiz, // callback to invoke with index of button pressed
            "Confirmar acción.", // title
            "Cancelar,OK");       // buttonLabels
    });
    
    $('#pedido_btnAtras').click(function(e) {
        e.preventDefault();
        navigator.notification.confirm(
            "Está a punto de salir, desea continuar? Se perderán los datos no guardados.", // message
            onConfirmBtnAtras, // callback to invoke with index of button pressed
            "Confirmar acción.", // title
            "Cancelar,OK");       // buttonLabels
        //var guardar = confirm("Está a punto de salir, desea continuar? Se perderán los datos no guardados.");
        //onConfirmBtnAtras(2);
    });

    $('#Pedido_btnCancelaPedido').click(function(e) {
        e.preventDefault();
        navigator.notification.confirm(
            "Está a punto de cancelar el pedido, desea continuar?", // message
            onConfirmBtnCancelaPedido, // callback to invoke with index of button pressed
            "Confirmar acción.", // title
            "Cancelar,OK");       // buttonLabels
        //var guardar = confirm("Está a punto de cancelar el pedido, desea continuar?");
    });
});      

$(document).on('pageinit', '#clienteDetalle', function() {    
    $('#clienteDetalle_listaCondiciones').change(function(e) {
        e.preventDefault();
        seleccionaCondicion();
    });
    $('#clienteDetalle_listaCondiciones').on('focus', function(e) {
        e.preventDefault();
        this.selectedindex = -1;
    });
    
    $('#clienteDetalle_listaSucursales').change(function(e) {
        e.preventDefault();
        seleccionaSucursal();
    });
    $('#clienteDetalle_listaSucursales').on('focus', function(e) {
        e.preventDefault();
        this.selectedindex = -1;
    });
    //Buscar cliente por código
    $('#clienteDetalle_txtCodCte').on('keypress', function(e) { 
        var cteInput = $(this).val();
        if (e.keyCode === 13) {
            if (cteInput !== "") {
                addCliente(cteInput);
            }
        }               
    });
    $("#clienteDetalle_btnScan").on("click", function(e) {
        e.preventDefault();
        clickScan(2);
    });
    $("#clienteDetalle_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
    
    $("#clienteDetalle_btnBuscar").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#buscaCliente', {changeHash: true});
    });
    
    $("#clienteDetalle_btnCartera").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#CarteraCte', {changeHash: true});
    });
    
    $("#clienteDetalle_btnAceptar").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
}); 

$(document).on('pageinit', '#buscaCliente', function() {  
    $("#buscaCliente_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#clienteDetalle', {changeHash: true});
    });
    $("#autocompleteCtes").filterable('option', 'filterCallback', function(idx, searchValue) {
        return false; 
    });
});     
$(document).on('pageinit', '#buscaProducto', function() {  
    $("#buscaProducto_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
    $("#autocompleteProds").filterable('option', 'filterCallback', function(idx, searchValue) {
        return false; 
    });
});    
$(document).on('pageinit', '#productos', function() {   
    $('#productos_listaUnidad').change(function(e) {
        e.preventDefault();
        seleccionaUnidad();
    });
    $('#productos_listaUnidad').on('focus', function(e) {
        e.preventDefault();
        this.selectedindex = -1;
    });
    $('#productos_btnInventario').click(function(e) {
        e.preventDefault();
        if ($('#productos_txtProducto').val() === "") {
            alertBox("No ha seleccionador un producto.", null, "BMS Móvil", "OK");
            return;
        }
    
        if ($('#productos_txtProducto').val() !== "") {
            var url = bmsServer + "/api/Productos/GetInventario",
                html = "",
                obj = {},
                estab = {},
         
                success = function(data) {
                    if (data[0] !== null) {             
                        if (booleano(bmsMultiestab)) {
                            $.each(data, function(i, val) {
                                obj = val;
                                estab = val.estab;
                        
                                html += "<li data-codigo='" + estab.codigo + "' data-nombre='" + estab.nombre + "'><a><h2 class='ui-li-heading-descrip'>" + estab.nombre + "</h2><p class=" + "ui-li-desc" + "><strong>Inventario UA : </strong>" + obj.inventarioUA + "</p><p class=" + "ui-li-desc" + "><strong>Inventario UC : </strong>" + obj.inventarioUC + "</p></a></li>";
                                //"<li" +" onclick='" + "cambiaEstab('" + estab.codigo +"','"+ estab.nombre + "')' "+ ">
                                //html += '<div class="ui-block-a">Código</div><div class="ui-block-b">'+estab.codigo+'</div><div class="ui-block-a">Nombre</div><div class="ui-block-b">'+estab.nombre+'</div><div class="ui-block-a">Inventario UA</div><div class="ui-block-b">'+obj.inventarioUA+'</div><div class="ui-block-a">Inventario UC</div><div class="ui-block-b">'+obj.inventarioUC+'</div><br>';                    
                            });
                        } else {
                            $.each(data, function(i, val) {
                                obj = val;
                                estab = val.estab;
                        
                                html += "<li><h2 class='ui-li-heading-descrip'>" + estab.nombre + "</h2><p class=" + "ui-li-desc" + "><strong>Inventario UA : </strong>" + obj.inventarioUA + "</p><p class=" + "ui-li-desc" + "><strong>Inventario UC : </strong>" + obj.inventarioUC + "</p></li>"; 
                                //html += '<div class="ui-block-a">Código</div><div class="ui-block-b">'+estab.codigo+'</div><div class="ui-block-a">Nombre</div><div class="ui-block-b">'+estab.nombre+'</div><div class="ui-block-a">Inventario UA</div><div class="ui-block-b">'+obj.inventarioUA+'</div><div class="ui-block-a">Inventario UC</div><div class="ui-block-b">'+obj.inventarioUC+'</div><br>';                    
                            });
                        }
                    
                        $.mobile.changePage('#inventario', {changeHash: true});

                        $('#inventario_list').empty();
                        $('#inventario_list').append(html);

                        $("#inventario_list").on("click", "li", function(event) {
                            console.log("Estamos en #inventario_list li on click");
                            bmsProdEstab = $(this).attr('data-codigo');
                            bmsEstabName = $(this).attr('data-nombre');                    
                            document.getElementById("productos_txtEstab").value = bmsEstabName;

                            $.mobile.changePage('#productos', {changeHash: true});
                        });
                        $("#inventario_list").listview("refresh");
                    }
                };
 
            $.ajax({
                       timeout: 10000,
                       type: 'get',
                       url: url,
                       data: {
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
                           alert(errorThrown);
                       }
                   }); 
        }            
    });
    
    $('#productos_btnFT').click(function(e) {
        e.preventDefault();
        mostrarFichasTecnicas($('#productos_txtProducto').val(), "#productos");  
    })
    $('#productos_btnCancelaProducto').click(function(e) {
        e.preventDefault();
        navigator.notification.confirm(
            "Desea limpiar el formulario? Se limpiaran todos los campos.", // message
            onConfirmBtnCancelaProducto, // callback to invoke with index of button pressed
            "Confirmar acción.", // title
            "Cancelar,OK");       // buttonLabels
        //var limpiar = confirm("Desea limpiar el formulario? Se limpiaran todos los campos.");    
    });
    //Al cambiar el valor de la cantidad actualizar importe, iva y total del producto
    $('#productos_txtCantidad').on('input propertychange', function(e) { 
        bmsCantidad = $(this).val();
        if (bmsCantidad === "") {
            return;
        }

        if ($.isNumeric($('#productos_txtCantidad').val())) {
            var cant = parseFloat($('#productos_txtCantidad').val());
            var precio = parseFloat($('#productos_txtPrecioUni').val());
            $('#productos_txtPrecioUni').val(precio);
            actualizaTotalesProducto(cant, precio);
        }else {
            document.getElementById("productos_txtCantidad").value = "";
            alertBox("Teclee la cantidad en números.", null, "BMS Móvil", "OK");     
            $('#productos_txtCantidad').focus();
        }                
    });
    
    $('#productos_btnAgregaProducto').click(function(e) {
        e.preventDefault();
        if ($('#productos_txtProducto').val() === "") {
            alertBox("No ha seleccionador un producto.", null, "BMS Móvil", "OK");
            //alert("No ha seleccionador un producto.");
            $('#productos_btnAgregaProducto').focus();
            return;
        }
        if (document.getElementById("productos_txtCantidad").value === "") {
            alertBox("Especifique una cantidad válida.", null, "BMS Móvil", "OK");
            //alert("Especifique una cantidad válida.");
            $('#productos_txtCantidad').focus();
            return;
        }
        if (bmsFichaTec !=="" && bmsFichas.length !== parseFloat(document.getElementById("productos_txtCantidad").value)) {
            alertBox("El número de fichas técnicas seleccionadas es diferente a la cantidad.", null, "BMS Móvil", "OK");
            //alert("Especifique una cantidad válida.");
            $('#productos_btnFT').focus();
            return;
        }
        incluyeProducto();
    });
    $('#productos_txtCantidad').on('focus', function(e) {
        e.preventDefault();
        this.select();
    });
    $('#productos_txtCantidad').on('blur', function(e) {
        e.preventDefault();
        var modif = false;
        ObtenerPrecio($('#productos_txtPrecioUni'), $('#productos_txtCantidad', modif));
    });
    //Al cambiar el valor del precio/u actualizar importe, iva y total del producto
    $('#productos_txtPrecioUni').on('focus', function(e) {
        this.select();
    });
    
    $('#productos_txtPrecioUni').on('input propertychange', function(e) {
        var cant = parseFloat($('#productos_txtCantidad').val()),
            precio = parseFloat($('#productos_txtPrecioUni').val());
        if (precio === 0 || precio === null || precio ==="") {
            return;
        }
        if ($.isNumeric(precio)) {
            if (precio < 0) {
                alertBox("Teclee un precio positivo.", null, "BMS Móvil", "OK");
                return;
            }
            actualizaTotalesProducto(cant, precio);
        } else {
            document.getElementById("productos_txtPrecioUni").value = "";
            alertBox("Teclee un precio válido.", null, "BMS Móvil", "OK");     
            $('#productos_txtPrecioUni').focus();
        }  
    });
    $('#productos_txtPrecioUni').on('keypress', function(e) { 
        var precioInput = $(this).val();
        if (e.keyCode === 13) {
            if (precioInput !== "") {
                //añadir
                if ($('#productos_txtProducto').val() === "") {
                    alertBox("No ha seleccionador un producto.", null, "BMS Móvil", "OK");
                    //alert("No ha seleccionador un producto.");
                    $('#productos_btnAgregaProducto').focus();
                    return;
                }
                if (document.getElementById("productos_txtCantidad").value === "") {
                    alertBox("Especifique una cantidad válida.", null, "BMS Móvil", "OK");
                    //alert("Especifique una cantidad válida.");
                    $('#productos_txtCantidad').focus();
                    return;
                }
                if (bmsFichaTec !=="" && bmsFichas.length !== parseFloat(document.getElementById("productos_txtCantidad").value)) {
                    alertBox("El número de fichas técnicas seleccionadas es diferente a la cantidad.", null, "BMS Móvil", "OK");
                    //alert("Especifique una cantidad válida.");
                    $('#productos_btnFT').focus();
                    return;
                }
                incluyeProducto();
            }
        }               
    });
    $('#productos_txtCantidad').on('keypress', function(e) { 
        var cantInput = $(this).val();
        if (e.keyCode === 13) {
            if (cantInput !== "") {
                $('#productos_txtPrecioUni').focus();
            }
        }             
    });
    //Buscar producto por código
    $('#productos_txtProducto').on('keypress', function(e) { 
        var prodInput = $(this).val();
        if (e.keyCode === 13) {
            if (prodInput !== "") {
                addProducto(prodInput);
            }
        }               
    });
    
    //On click productos_btnScan y clienteDetalle_btnScan buscar por código de barras
    $("#productos_btnScan").on("click", function(e) {
        e.preventDefault();
        clickScan(1);
    });
    $("#productos_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
    
    $("#productos_btnBuscar").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#buscaProducto', {changeHash: true});
    });
});  
$(document).on('pageinit', '#productosEditar', function() {   
    $('#productosEditar_listaUnidad').change(function(e) {
        e.preventDefault();
        seleccionaUnidad(true);
    });
    $('#productosEditar_listaUnidad').on('focus', function(e) {
        e.preventDefault();
        this.selectedindex = -1;
    });
    $('#productosEditar_btnInventario').click(function(e) {
        e.preventDefault();
        if ($('#productosEditar_txtProducto').val() === "") {
            alertBox("No ha seleccionador un producto.", null, "BMS Móvil", "OK");
            return;
        }
    
        if ($('#productosEditar_txtProducto').val() !== "") {
            var url = bmsServer + "/api/Productos/GetInventario",
                html = "",
                obj = {},
                estab = {},
                prod = prodObjModif.codigo,
         
                success = function(data) {
                    if (data[0] !== null) {             
                        if (booleano(bmsMultiestab)) {
                            $.each(data, function(i, val) {
                                obj = val;
                                estab = val.estab;
                                html += "<li data-codigo='" + estab.codigo + "' data-nombre='" + estab.nombre + "'><a><h2 class='ui-li-heading-descrip'>" + estab.nombre + "</h2><p class=" + "ui-li-desc" + "><strong>Inventario UA : </strong>" + obj.inventarioUA + "</p><p class=" + "ui-li-desc" + "><strong>Inventario UC : </strong>" + obj.inventarioUC + "</p></a></li>";
                            });
                        } else {
                            $.each(data, function(i, val) {
                                obj = val;
                                estab = val.estab;
                                html += "<li><h2 class='ui-li-heading-descrip'>" + estab.nombre + "</h2><p class=" + "ui-li-desc" + "><strong>Inventario UA : </strong>" + obj.inventarioUA + "</p><p class=" + "ui-li-desc" + "><strong>Inventario UC : </strong>" + obj.inventarioUC + "</p></li>"; 
                            });
                        }
                    
                        $.mobile.changePage('#inventarioEditar', {changeHash: true});

                        $('#inventarioEditar_list').empty();
                        $('#inventarioEditar_list').append(html);

                        $("#inventarioEditar_list").on("click", "li", function(event) {
                            console.log("Estamos en #inventarioEditar_list li on click");
                            bmsProdEstab = $(this).attr('data-codigo');
                            bmsEstabName = $(this).attr('data-nombre');                    
                            document.getElementById("productosEditar_txtEstab").value = bmsEstabName;

                            $.mobile.changePage('#productosEditar', {changeHash: true});
                        });
                        $("#inventarioEditar_list").listview("refresh");
                    }
                };
 
            $.ajax({
                       timeout: 10000,
                       type: 'get',
                       url: url,
                       data: {
                    "producto": prod
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
    });
    $('#productosEditar_btnFT').click(function(e) {
        e.preventDefault();
        mostrarFichasTecnicas($('#productosEditar_txtProducto').val(), "#productosEditar");  
    });
    $('#productosEditar_btnAgregaProducto').click(function(e) {
        e.preventDefault();
        if ($('#productosEditar_txtProducto').val() === "") {
            alertBox("No hay producto seleccionado para editar.", null, "BMS Móvil", "OK");
            //alert("No hay producto seleccionado para editar.");
            return;
        }
        if (document.getElementById("productosEditar_txtCantidad").value === "") {
            alertBox("Especifique una cantidad válida.", null, "BMS Móvil", "OK");
            //alert("Especifique una cantidad válida.");
            $('#productosEditar_txtCantidad').focus();
            return;
        }
        if (bmsFichaTec !=="" && bmsFichas.length !== parseFloat(document.getElementById("productosEditar_txtCantidad").value)) {
            alertBox("El número de fichas técnicas seleccionadas es diferente a la cantidad.", null, "BMS Móvil", "OK");
            //alert("Especifique una cantidad válida.");
            $('#productos_btnFT').focus();
            return;
        }
        //Llamar método booleano modificaDetalle	
        
        modificaDetalle();
    });
    $('#productosEditar_txtCantidad').on('input propertychange', function(e) { 
        bmsCantidad = $(this).val();
        if (bmsCantidad === "") {
            return;
        }

        if ($.isNumeric($('#productosEditar_txtCantidad').val())) {
            var cant = parseFloat($('#productosEditar_txtCantidad').val()),
                precio = parseFloat($('#productosEditar_txtPrecioUni').val());
            actualizaTotalesProductosEditar(cant, precio);
        }else {
            document.getElementById("productosEditar_txtCantidad").value = "";
            alertBox("Teclee la cantidad en números.", null, "BMS Móvil", "OK");      
            $('#productosEditar_txtCantidad').focus();
        }                
    });
    $('#productosEditar_txtCantidad').on('blur', function(e) {
        var modif = true;
        ObtenerPrecio($('#productosEditar_txtPrecioUni'), $('#productosEditar_txtCantidad', modif));
    });
    $('#productosEditar_txtCantidad').on('focus', function(e) {
        this.select();
    });
    $('#productosEditar_txtPrecioUni').on('focus', function(e) {
        this.select();
    });
    $('#productosEditar_txtPrecioUni').on('input propertychange', function(e) {
        if ($.isNumeric($('#productosEditar_txtPrecioUni').val())) {
            var cant = parseFloat($('#productosEditar_txtCantidad').val()),
                precio = parseFloat($('#productosEditar_txtPrecioUni').val());
            actualizaTotalesProductosEditar(cant, precio);  
        } else {
            document.getElementById("productosEditar_txtPrecioUni").value = "";
            alertBox("Teclee la cantidad en números.", null, "BMS Móvil", "OK");     
            $('#productosEditar_txtPrecioUni').focus();
        }
    });
    $("#productosEditar_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedidoDetalle', {changeHash: true});
    });
});  
$(document).on('pageinit', '#pedidoDetalle', function() {   
    $('#pedidoDetalle_btnBorraTodos').click(function(e) {
        e.preventDefault();
        var length = bmsLineaDetalle.length;
        if (length !== 0) {
            //for (i = 0; i < length; i++) {
            //  eliminado = bmsLineaDetalle.splice(i,1);
            navigator.notification.confirm(
                "Está seguro de borrar todos los productos del pedido?.", // message
                onConfirmBtnBorraTodos, // callback to invoke with index of button pressed
                "Confirmar acción.", // title
                "Cancelar,OK");       // buttonLabels
            //var confirma = confirm("Está seguro de borrar todos los productos del pedido?.");      
        }                  
    });
    $("#pedidoDetalle_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#pedido', {changeHash: true});
    });
    $(document).on('taphold', 'li.item', tapholdHandler);
    
    function tapholdHandler(e) {
        e.preventDefault();
        var i = $(this).index();
        var listitem = $(this);
        navigator.notification.confirm(
            "Que desea hacer con el producto?.", // message
            function (buttonIndex) {               // callback to invoke with index of button pressed
                onConfirmTapHold(buttonIndex, i, listitem);
            }, 
            "Confirmar acción.", // title
            "Cancelar,Modificar,Eliminar");       // buttonLabels
        // callback to invoke with index of button pressed     
    }   
}); 
$(document).on('pageinit', '#inventario', function() {   
    $("#inventario_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#productos', {changeHash: true});
    });
}); 
$(document).on('pageinit', '#inventarioEditar', function() {   
    $("#inventarioEditar_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#productosEditar', {changeHash: true});
    });
}); 
$(document).on('pageinit', '#reporte', function() { 
    $("#reporte_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#reporteFiltro', {changeHash: true});
    });
}); 
$(document).on('pageinit', '#reporteFiltro', function() { 
    $("#reporteFiltro_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#selectorTipo', {changeHash: true});
    });
    $('#reporteFiltro_btnActualizar').click(function(e) {
        e.preventDefault();
        var url = bmsServer + "/api/General/GetReporte",
            html = "",
            fi = $("#reporteFiltro_dtpDe").val(), // +' 00:00:00',
            ff = $("#reporteFiltro_dtpA").val(), // +' 23:59:59',
            fiObj = new Date(convertToSlash(fi)),
            ffObj = new Date(convertToSlash(ff)),
            fiFormated = getFecha(fiObj),
            ffFormated = getFecha(ffObj),
        //fiFormated = moment(fi, "YYYY-MM-DD"),
        //ffFormated = moment(ff, "YYYY-MM-DD"),
         
            success = function(data) {
                if (data.length === 0) { 
                    alertBox("No hay pedidos para mostrar.", null, "BMS Móvil", "OK");
                    return;
                } else { 
                    html+= "<tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Total</th></tr>";
                    $.each(data, function(i, val) {
                        html += "<tr><td>" + val.folio + "</td><td>" + val.fecha + "</td><td>" + val.razon_social + "</td><td>" + numeral(val.total).format('$0,0.00') + "</td></tr>";
                    });

                    $.mobile.changePage('#reporte', {changeHash: true});
                    $('#reporteTabla').empty();
                    $('#reporteTabla').html(html);
                    //$("#reporteTabla").selectmenu('refresh', true);   
                }
            };

        $.ajax({
                   timeout: 10000,
                   type: 'get',
                   url: url,
                   data: {
                "usuario": bmsUser, "FI": fiFormated, "FF": ffFormated
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
}); 
$(document).on('pageinit', '#detalle', function() { 
    $("#detalle_btnSalir").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#Login', {changeHash: true});
    });
});
$(document).on('pageinit', '#fichasTec', function() { 
    $('#fichasTec_btnAtras').click(function(e) {
        e.preventDefault();
        seleccionarFichasTec();
    });
});
$(document).on('pageinit', '#AutRemota', function() { 
    $('#fichasTec_btnAtras').click(function(e) {
        e.preventDefault();
        seleccionarFichasTec();
    });
});
$(document).on('pageinit', '#CarteraCte', function() {   
    $("#CarteraCte_btnAtras").on("click", function(e) {
        e.preventDefault();
        $.mobile.changePage('#clienteDetalle', {changeHash: true});
    });
}); 
