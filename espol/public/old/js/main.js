$(document).ready(function(){
	$("#img1").tooltipster({
		animation: 'fade',
   		delay: [5,1500],
   		interactive: true,
	});
	var pga=new Array();
	var pestudios=new Array();//plan de estudios para almacenar todos los nombres de las asignaturas
	var pestudios_credits=new Array();
	var pestudios_codigos=new Array();
	var b=0;
	var pgp=[4.51,3.65,4.48,4.12,3.40,3.50];//obtenido desde infoalumnos
	var pga=[4.51,4.07,4.33,4.41,4.29,4.26];//obtenido desde infoalumnos

	function requisitos(nameCourse){
		$.getJSON("ProgramStructure.json", function(data,error){
			for (var w = 1; w <=69; w++) {
				$("#"+w).css({"opacity":".5"});
			}
			for (var program in data) {
				var flag=0;
				var nTerms=data[program].terms.length;
				for (var i = 0; i < nTerms; i++) {
					var nCourses=data[program].terms[i].courses.length;
					for (var j = 0; j < nCourses; j++) {//Numero de cursos en el semestre indicado
						if(data[program].terms[i].courses[j].name==nameCourse){
							var Nrequisites=data[program].terms[i].courses[j].requisites.length;
							
							var credits=data[program].terms[i].courses[j].credits;
							for (var k = -1; k < Nrequisites; k++) {//Requisitos de la  asignatura
								var requirement=data[program].terms[i].courses[j].requisites[k];
								for (var l = 1; l <=69; l++) {
									if(pestudios[l-1]==nameCourse&&flag==0){
										$("#"+l).removeClass("cursoSeleccionado");
									    $("#"+l).removeClass("course");
									    $("#"+l).removeClass("courseReq");
										$("#"+l).addClass("DesempCurso");
										$("#"+l+" .box.d").addClass("boxdBug");
//										$("#"+l).addClass("DesempCurso").append($("<input/>",{class:"btnCredit",value:credits,title:"créditos",disabled:"disabled"}));
										$("#"+l).css({"opacity":""});
										flag=1;
									}
									if (pestudios[l-1]==requirement) {
										$("#"+l).removeClass("cursoSeleccionado");
									    $("#"+l).removeClass("course");
									    $("#"+l).removeClass("DesempCurso");
										$("#"+l+" .box.d").removeClass("boxdBug");
										$("#"+l).css({"opacity":""});
										$("#"+l).addClass("courseReq").append($("<input/>",{class:"btnreq",value:"Req",title:"requisito",disabled:"disabled"}));
									}
								}
							}
						}
					}
				}
			}
		});
	}
	//CARGA DE DATOS Y ASIGNACIÓN DE NOTAS A ASIGNATURAS YA CURSADAS
	function encerarDatos(){
		for (var i = 0; i < b; i++) {
				$("#btn"+i).removeClass("botonSelec");
				$("#btn"+i).removeClass("botonSelecPerCurs");
			}
            var pga=new Array();
            var repeticiones=new Array();
        	for (var i = 1; i <= 69; i++) {
        		repeticiones[i]=0;
        		$("#"+i).css({"opacity":""});
        		$("#"+i).removeClass("cursoSeleccionado");
        		$("#"+i).removeClass("DesempCurso");
				$("#"+i+" .box.d").removeClass("boxdBug");
        		$("#"+i).removeClass("courseReq");
        		$("#"+i).addClass("course");
				$("#"+i).find("svg").remove();
				$("#"+i).find(".btnreq").remove();
        		//$("#"+i).text("");
        		//$("#"+i).append(pestudios[i-1]);
        	}
	}
	function cargarDatos2(){
		$.getJSON("student.json", function(data,error){
			for (var i = 0; i < b; i++) {
				$("#btn"+i).removeClass("botonSelec");
				$("#btn"+i).removeClass("botonSelecPerCurs");
			}
            var pga=new Array();
            var repeticiones=new Array();
        	for (var i = 1; i <= 69; i++) {
        		repeticiones[i]=0;
        		$("#"+i).css({"opacity":""});
        		$("#"+i).removeClass("cursoSeleccionado");
        		$("#"+i).removeClass("DesempCurso");
				$("#"+i+" .box.d").removeClass("boxdBug");
        		$("#"+i).removeClass("courseReq");
        		$("#"+i).addClass("course");
				$("#"+i)
        		//$("#"+i).text("");
        		//$("#"+i).append(pestudios[i-1]);
        	}
			//FOR PARA ASIGNAR LAS NOTAS DE TODAS LAS ASIGNATURAS YA CURSADAS.
			for (var CantSem in data) {
				/*var nameStudent=data[CantSem].name;
				var cityStudent=data[CantSem].city;
				var emailStudent=data[CantSem].email;
				var programName=data[CantSem].programName;
				var version=data[CantSem].startYear;
				$("#tooltip_content").html("Nombre estudiante: "+nameStudent+"<br>Año de ingreso: "+version+"<br>Ciudad procedencia: "+cityStudent+"<br>Email: <a href='https://outlook.com/alumnos.uach.cl'>"
					+emailStudent+"</a><br>Plan de estudios: "+programName+"<br>Versión plan de estudios: "+version);*/

					//////////////////////////////////////////////////////////////////////////////////////////////////////
					var NSemestres=data[CantSem].terms.length;//Numero de semestres cursados por el estudiante
			    //var NSemestres=data[CantSem].courseTaken.length;//Numero de semestres cursados por el estudiante

					for (var i = 0; i < NSemestres; i++) {
			    	var Cursos=new Array();
			    	var Notas=new Array();
	        		var curso;
	        		var PGA=0;
							///////////////////////////////////////////////////////////////////////////////////////////////////
	        		var Periodo=data[CantSem].terms[i].semester+" "+data[CantSem].terms[i].year;
							//var Periodo=data[CantSem].courseTaken[i].semester+" "+data[CantSem].courseTaken[i].year;

							//En el api no se encuentra el atributo state por termino
							//var stateSemester=data[CantSem].courseTaken[i].state;

					var Nasignaturas=data[CantSem].terms[i].coursesTaken.length;//numero de asignaturas en el semestre correspondiente
							//var Nasignaturas=data[CantSem].courseTaken[i].Courses.length;//numero de asignaturas en el semestre correspondiente

					if(1===1){////////////////////////////////////// COMPROBAR LO DE SEMESTRE ANULADO
							//if (stateSemester=="cursed") {
		        		for (var j = 0; j < Nasignaturas; j++) {
										var notaAprob = 6;
										//var notaAprob=data[CantSem].terms[i].Courses[j].gradeAprobation;
										curso = data[CantSem].terms[i].coursesTaken[j].name;
										//curso=data[CantSem].courseTaken[i].Courses[j].nombre;

										nota =data[CantSem].terms[i].coursesTaken[j].grade;
										//nota=data[CantSem].courseTaken[i].Courses[j].grade;

										var statusCourse=data[CantSem].terms[i].coursesTaken[j].state;
			            	//var statusCourse=data[CantSem].courseTaken[i].Courses[j].status;

										Cursos.push(curso);
		                Notas.push(nota);
		                PGA=PGA+(nota/Nasignaturas);
			                for (var k = 1; k <= 69; k++) {
			                	if (Cursos[j]==pestudios[k-1]) {
									var class_box_b = get_class_nota(Notas[j],statusCourse);
									$("#"+k+" .box.b").addClass(class_box_b);
			                		if(statusCourse=="passed"){//if(statusCourse=="passed"){
														$("#"+k).removeClass("cursoSeleccionado");
														$("#"+k).addClass("course");
														//$("#"+k).text("");
														if(Notas[j]!=0){
															if(repeticiones[k]>=1){
																$("#"+k+" .box.d").append($("#"+k+" .box.b").find("input"));
																$("#"+k+" .box.d").find("input").addClass("btnRepet");
																$("#"+k+" .box.d").find("input").val("");
																$("#"+k+" .box.b").text("");
															}
															$("#"+k+" .box.b").append($("<input/>",{class:"btnAprob",value:Notas[j].toFixed(1),disabled:"disabled"}));
														}
														else{
															$("#"+k+" .box.b").append($("<input/>",{class:"btnAprob",value:"A",disabled:"disabled"}));
														}
										$("#"+k+" .box.b .btnAprob").addClass(class_box_b+"bt");
														break;
			                		}
									if(statusCourse=="reprobed"){
														repeticiones[k]=repeticiones[k]+1;
														$("#"+k).removeClass("cursoSeleccionado");
														$("#"+k).addClass("course");
														if(Notas[j]!=0){
															$("#"+k+" .box.b").append($("<input/>",{class:"btnReprob",value:Notas[j].toFixed(1),disabled:"disabled"}));
														}else{
															$("#"+k+" .box.b").append($("<input/>",{class:"btnReprob",value:"R".toFixed(1),disabled:"disabled"}));
														}
														$("#"+k+" .box.b .btnReprob").last().addClass(class_box_b+"bt");
														//$("#"+k).text("");
														/*
														if (repeticiones[k]==1) {
															$("#"+k+" .box.b").append($("<input/>",{class:"btnReprob",value:Notas[j].toFixed(1),disabled:"disabled"}));
															$("#"+k+" .box.b .btnReprob").addClass(class_box_b+"bt");
														}
														else{
															$("#"+k+" .box.b").append($("<input/>",{class:"btnrepe",value:repeticiones[k],disabled:"disabled",title:"número repeticiones"}));
															$("#"+k+" .box.b .btnrepe").addClass(class_box_b+"bt");
														}
														*/
														break;
									}
			                		else{
				                		$("#"+k).removeClass("cursoSeleccionado");
										$("#"+k+" .box.b").removeClass(class_box_b);
										$("#"+k+" .box.b").addClass("anulado");
				                		$("#"+k).addClass("course");
				                		$("#"+k+" .box.b").append($("<input/>",{class:"btnAnula",value:"N",disabled:"disabled",title:"anulado"}));
										$("#"+k+" .box.b .btnAnula").addClass("anuladobt");
				                		break;
		                			}
			                	}
			                }
		            	}
	            	}
	            	else{//SI EL SEMESTRE FUE ANULADO
	            		for (var m = 0; m < b; m++) {
	            			if($("#btn"+m).attr("value")==Periodo){
	            				$("#btn"+m).removeClass("boton");
	            				$("#btn"+m).addClass("botonSemAnulado").attr("disabled","disabled").attr("title","Semestre anulado");
	            			}
	            		}
	            	}
			    }
			}
	    });  //fin de la carga del archivo student.json
	}//fin de la función cargarDatos

	function cargaGraficaCurso(cursoid,sem){
		$.getJSON("student.json", function(data,error){
			for(var k=0;k<b;k++){
				$("#btn"+k).removeClass("botonSelecPerCurs");
				$("#btn"+k).removeClass("botonSelec");
			}
			var idcurso=$(cursoid).attr("id");
			var notas=new Array();
			var distrNotas=new Array();
			for (var program in data) {

				//////////////////////////////////////////////////////////////////////////////////////////////////////
				var NSemestres=data[program].terms.length;//Numero de semestres cursados por el estudiante
				//var NSemestres=data[program].courseTaken.length;//Numero de semestres cursados por el estudiante

				for (var i = 0; i < NSemestres; i++) {
					if(sem==""){//cuando se hace click en un curso que no esta cursado en el periodo clickeado
						var Nasignaturas=data[program].terms[i].coursesTaken.length;//numero de asignaturas en el semestre correspondiente
						for (var j = 0; j < Nasignaturas; j++) {
							var per=data[program].terms[i].semester+" "+data[program].terms[i].year;//periodo

							if ((data[program].terms[i].coursesTaken[j].name==pestudios[idcurso-1])/*&&data[program].courseTaken[i].Courses[j].status=="passed"*/) {
								notas.push(data[program].terms[i].coursesTaken[j].grade);
								var nota=d3.max(notas);
								var status=data[program].terms[i].coursesTaken[j].state;
								//////////////////////////////////////////////////////////////////////////////////////
								let distributionCohort = data[program].terms[i].coursesTaken[j].cohort == null || data[program].terms[i].coursesTaken[j].cohort.distribution == null ? [] :
								data[program].terms[i].coursesTaken[j].cohort.distribution.map((element)=>{
									return element.value;
								});
								distrNotas.push(distributionCohort);
								//else distrNotas.push([0,0,0,2,3,4])
								for (var k = 0; k < b; k++) {
									if ($("#btn"+k).attr("value")==per) {
										$("#btn"+k).addClass("botonSelecPerCurs");
									}
								}
							}
						}
					}
					else{//cuando se hace click en un curso dentro del periodo seleccionado

						var Nasignaturas=data[program].terms[i].coursesTaken.length;//numero de asignaturas en el semestre correspondiente
						for (var j = 0; j < Nasignaturas; j++) {
							var per=data[program].terms[i].semester+" "+data[program].terms[i].year;//periodo
							if ((data[program].terms[i].coursesTaken[j].name==pestudios[idcurso-1])&&per==sem/*&&data[program].courseTaken[i].Courses[j].status=="passed"*/) {

									var nota=data[program].terms[i].coursesTaken[j].grade
									/////////////////////////////////////////////////////////No tomo en cuenta materias anuladas
									var status=data[program].terms[i].coursesTaken[j].state;
									/*
								    //$("#"+idcurso).text("");
									if (status === 'passed') {
										if(nota!=0){$("#"+idcurso).append(pestudios[idcurso-1]).append($("<input/>",{class:"btnAprob",value:nota.toFixed(1),disabled:"disabled"}));}
														else{$("#"+idcurso).append(pestudios[idcurso-1]).append($("<input/>",{class:"btnAprob",value:nota,disabled:"disabled"}));}
									}
									else{
										$("#"+idcurso).append(pestudios[idcurso-1]+"  ").append($("<input/>",{class:"btnReprob",value:nota.toFixed(1),disabled:"disabled"}));
									}
									*/
									//////////////////////////////////////////////////////////////////////////////////////
									let distributionCohort = data[program].terms[i].coursesTaken[j].cohort == null || data[program].terms[i].coursesTaken[j].cohort.distribution == null ? [] :
									data[program].terms[i].coursesTaken[j].cohort.distribution.map((element)=>{
										return element.value;
									});
									distrNotas.push(distributionCohort);

									for (var k = 0; k < b; k++) {
										if ($("#btn"+k).attr("value")==per) {
											$("#btn"+k).addClass("botonSelecPerCurs");
										}
									}
							}
						}
					}
				}
			}
			$(cursoid).removeClass("course");
			$(cursoid).addClass("DesempCurso");
			if(distrNotas.length>0){
				var svg=d3.select(cursoid).append("svg");//.attr("fill","white");
				var escalaNotas=[1,2,3,4,5,6,7];//notas eje x
				svg.attr("width",85)
				.attr("style","margin-top:10%;")
				.attr("height",55);//7 centimetros para el espacio entre las graficas comparativas
				var width = 80,//ancho de la grafica
				height = 50;
			  	var x = d3.scale.ordinal().rangeRoundBands([0, width],.05);
			  	var y = d3.scale.ordinal().rangeRoundBands([height, 0],.05);
			  	x.domain(["1","2","3","4","5","6","7"]);
				y.domain([1,2,3,4,5,6,7,8,9,10]);
				var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");
				var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
				svg.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(3,40)")
			    .attr("font-size","5px")
			    .call(xAxis)
			    .append("text")
			    .attr("transform","translate(120,15)")
			    .attr("text-anchor", "end")
			    .attr("dy", "-.55em")
			    .attr("font-size","7px")
			    .text("Escala notas");

			  	svg.append("text").attr("font-size","8px").attr("transform","translate(3,6)").text("Calificaciones "+per);
			  	svg.selectAll(".bar")
				.data(escalaNotas)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("fill",function(d,i){
					if ((escalaNotas[i]<=nota)&&(nota<escalaNotas[i+1])){
						//if (nota>=4.0) {return "green";}else{return "red";}
						if(status === 'passed'){return "green";}else{return "red";}
					}
					else{return "gray";}
				})
				.attr("rx",2)
				.attr("ry",2)
				.attr("transform", "translate(0,-5)")
				.attr("x",function(d,i) { return x(escalaNotas[i])+6; } )
				.attr("width", "5px")
				.attr("y",function(d,i) {
				 return y(distrNotas[distrNotas.length-1][i]); } )
				.attr("height", function(d,i) {return height - y(distrNotas[distrNotas.length-1][i])-5; });
			}
		});
	}//FIN DE LA FUNCION cargaGraficaCurso

	function cargaGraficaCursoHist(cursoid){
		$.getJSON("student.json", function(data,error){
			var idcurso=$(cursoid).attr("id");
			var svg=d3.select(cursoid).append("svg");
			for (var program in data) {
				var nTerms=data[program].terms.length;
				for (var i = 0; i < nTerms; i++) {
					var nCourses=data[program].terms[i].coursesTaken.length;
					for (var j = 0; j < nCourses; j++) {
						//var Area=data[program].terms[i].coursesTaken[j].area;
						if (data[program].terms[i].coursesTaken[j].name==pestudios[idcurso-1]) {
							//var historic=data[program].terms[i].coursesTaken[j].historic;
							var historic = data[program].terms[i].coursesTaken[j].group == null || data[program].terms[i].coursesTaken[j].group.distribution == null ? [] :
							data[program].terms[i].coursesTaken[j].group.distribution.map((element)=>{
								return element.value;
							});
							svg.append("rect").attr("width","100%").attr("height","100%").attr("fill","transparent");//.attr("rx",5).attr("ry",5).attr("opacity",.9);//.attr("fill",colors[k]);
						}
					}
				}
			}
			var escalaNotas=[2,3,4,5,6,7];//notas eje x
			svg.attr("width",85)
			.attr("style","margin-top:20%;")
			.attr("height",55);//7 centimetros para el espacio entre las graficas comparativas
			var width = 80,//ancho de la grafica
			height = 50;
		  	var x = d3.scale.ordinal().rangeRoundBands([0, width],.05);
		  	var y = d3.scale.ordinal().rangeRoundBands([height, 0],.05);
		  	x.domain(["1","2","3","4","5","6","7"]);
			y.domain([1,2,3,4,5,6,7]);
			var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");
			var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
			svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(3,40)")
		    .attr("font-size","5px")
		    .call(xAxis);
		    svg.append("text").attr("font-size","8px").attr("transform","translate(3,15)").text("Calificaciones Históricas");


		  	svg.selectAll(".bar")
			.data(escalaNotas)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("fill","gray")
			.attr("rx",2).attr("ry",2)
			.attr("transform", "translate(0,-5)")
			.attr("x",function(d,i) { return x(escalaNotas[i])+6; } )
			.attr("width", "5px")
			.attr("opacity",".9")
			.attr("y",function(d,i) {
			 return y(historic[i]); } )
			.attr("height", function(d,i) {return height - y(historic[i])-5; });
		});
	}//FIN DE LA FUNCION cargaGraficaCursoHist
	//carga del plan de estudios
	var semestres=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
	$.getJSON("ProgramStructure.json", function(data,error){
		for (var program in data) {
			//var titulo=data[program].programName.slice(10);
			var titulo=data[program].name;
			var idCurso=1;
			var nTerms=data[program].terms.length;
			for (var i = 0; i < nTerms; i++) {
				var idSem=data[program].terms[i].position;
				$("#pestudios").append($("<div/>",{class:"semestre",id:"s"+idSem}).html("<center>"+semestres[i]+"</center>")).css({"font-size":"14px","font-weight":"bold"});
				var nCourses=data[program].terms[i].courses.length;
				var Area;
				for (var j = 0; j < nCourses; j++) {
					$("#s"+idSem).append(crear_grid_materia(idCurso));
					idCurso++;
				}
			}
		}
		//ACCIONES QUE SE REALIZAN CUANDO SE PRESIONA UN CURSO
		$(".course").click(function(){
			d3.selectAll("circle").attr("fill",function(d,i){
				if (i>=pgp.length) {return "steelblue";}
				else{return "red";}
			});
			var cursoid=$(this).attr('id');
			var nameCourse=pestudios[cursoid-1];
			var sem="";
			if ($(this).hasClass("DesempCurso")) {
				encerarDatos();
			}else{
				for (var j = 1; j <=69; j++) {
				if (pestudios[j-1]==nameCourse) {
					if ($(this).hasClass("cursoSeleccionado")) {
						for (var i = 0; i < b; i++) {
							if ($("#btn"+i).hasClass("botonSelec")) {//para determinar en que periodo se curso la asignatura clickeada
								var sem=$("#btn"+i).attr("value");
								cargaGraficaCurso(this,sem);
							}
						}
					}
					else{
						cargaGraficaCurso(this,sem);
					}
					cargaGraficaCursoHist(this);
					requisitos(nameCourse);
				}
				else{
					$("#"+j).css({"opacity":".5"});
				}
			}	
		  }
		});
	});
	function get_class_nota(nota,status){
		var class_nota= "N/D";
		if(nota>=4.5){
			class_nota="rango4";
		}else if(nota>=4 && nota<4.5){
			class_nota="rango3";
		}else if(nota>=3.5 && nota<4){
			class_nota="rango2";
		}else if(nota>=1 && nota<3.5){
			class_nota="rango1";
		}else if(nota==0){
			if(status=="passed"){
				class_nota="rango4";
			}else{
				class_nota="rango1";
			}
		}
		return class_nota;
	}
	function crear_grid_materia(id_materia){
		var div_string = "";
		div_string = "<div id='"+id_materia+"' class='course'><div class='box a'></div><div class='box b'></div><div class='box c'></div><div class='box d'></div></div>";
		return div_string;
	}
	//CARGA DE GRAFICA DEL PGA Y PGP
	function cargaGraficaPGA(PGP,PGA){
		var svg=d3.select("svg");
		var width=1100;
		var height=120;
		var g=d3.select("svg").append("g").attr("id","ContenedorGrafica");
		g.attr("transform","translate(10,10)");
	    var x = d3.scale.ordinal().rangeRoundBands([0, width],0.6);//of
		var y = d3.scale.ordinal().rangeRoundBands([height, 0],0,1);//of
		y.domain(["1.0","2.0","3.0","4.0","5.0","6.0","7.0"]);
		var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
		var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");//donde se ubica la escala del eje
		g.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(30,105)")
	    .attr("font-size","10px")
	    .call(xAxis)
	    .append("text")
	    .attr("transform","translate(1150,10)")
	    .attr("text-anchor", "end")
	    .attr("dy", "-.55em")
	    .attr("font-size","10px")
	    .text("Semestre");

	    g.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(30,-3)")//of
	    .attr("font-size","8px")
	  	.call(yAxis)
	  	.append("text")
	  	.attr("transform", "translate(75,0)")
	  	.attr("y", 6)
	  	.attr("dy", ".71em")
	  	.style("text-anchor", "end")
	  	.attr("font-size","10px")
	  	.text("Escala de notas");


	  	//LINEA QUE UNE LOS PUNTOS DEL PGA
		g.selectAll(".circle")
		.data(PGA)
		.enter().append("line")
		.attr("x1",function(d,i){return 59+60*(i); })
		.attr("y1",function(d,i){return height- PGA[i]*10-26;})
		.attr("x2",function(d,i){if(PGA[i+1]){return 59+60*(i+1);}else{return 59+60*(i);}})
		.attr("y2",function(d,i){if(PGA[i+1]){return height- PGA[i+1]*10-26;}else{return height- PGA[i]*10-26;}})
		.attr("stroke-width",2)
		.attr("stroke","red");


		//LINEA QUE UNE LOS PUNTOS DEL PGP
		g.selectAll(".circle")
		.data(PGP)
		.enter().append("line")
		.attr("x1",function(d,i){return 59+60*(i); })
		.attr("y1",function(d,i){return height- PGP[i]*10-26;})
		.attr("x2",function(d,i){if(PGP[i+1]){return 59+60*(i+1);}else{return 59+60*(i);}})
		.attr("y2",function(d,i){if(PGP[i+1]){return height- PGP[i+1]*10-26;}else{return height- PGP[i]*10-26;}})
		.attr("stroke-width",2)
		.attr("stroke","steelblue");

		var div=d3.select("#pga").append("div")
    	.attr("class","tooltipPGP").style("opacity", 0);
    	var div2=d3.select("#pga").append("div")
    	.attr("class","tooltipPGA").style("opacity", 0);


    	//CIRCULOS PARA EL PGA
		g.selectAll(".circle")
		.data(PGA)
		.enter().append("circle")
		.attr("class","pga")
		.attr("fill","red")
		.attr("r",5)
		.attr("cx",function(d,i) {return 59+60*i; } )
		.attr("cy",function(d,i) {return height- PGA[i]*10-26; })
		.on("mouseover",function(d,i){
			div2.transition()
                .duration(200)
                .style("opacity", .9);
			div2.html(PGA[i]).style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout",function(d,i){
			div2.transition()
                .duration(500)
                .style("opacity", 0);
		});



    	//CIRCULOS PARA EL PGP
		g.selectAll(".circle")
		.data(PGP)
		.enter().append("circle")
		.attr("class","pgp")
		.attr("fill","steelblue")
		.attr("r",5)
		.attr("cx",function(d,i) {return 59+60*i; } )
		.attr("cy",function(d,i) {return height- PGP[i]*10-26; })
		.on("mouseover",function(d,i){
			var text=$("#btn"+i).val();
			var id=$("#btn"+i).attr("id");
			botonclickeado(id,text);
			div.transition()
                .duration(200)
                .style("opacity", .9);
			div.html(PGP[i]).style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout",function(d,i){
			encerarDatos()
			//cargarDatos2();
			div.transition()
                .duration(500)
                .style("opacity", 0);
                d3.select(this).attr("fill","steelblue");

		});


		//SIMBOLOGIA DE LOS PUNTOS
		g.append("ellipse")
		.attr("fill","steelblue")
		.attr("rx",5)
		.attr("ry",5)
		.attr("cx",200)
		.attr("cy",7);
		g.append("text").text("PGP").attr("transform","translate(210,10)");
		g.append("ellipse")
		.attr("fill","red")
		.attr("rx",5)
		.attr("ry",5)
		.attr("cx",330)
		.attr("cy",7);
		g.append("text").text("PGA").attr("transform","translate(340,10)");


	}//fin de la funcion cargaGraficaPGA
	//ACCIONES QUE SE REALIZAN CUANDO SE CLICKEA UN BOTÓN
	function botonclickeado(idBoton,textBoton){
		$.getJSON("student.json", function(data,error){
			var semestre=textBoton;
			for (var j = 0; j < pgp.length; j++) {
				if (idBoton=="btn"+j) {
					d3.selectAll("circle").attr("fill",function(d,i){
						if (j+pgp.length==i) {return "#FFFF00";}else{
							if (i>=pgp.length) {return "steelblue";}
							else{return "red";}
						}
					});
				}
			}
			for (var i = 0; i < b; i++) {
				$("#btn"+i).removeClass("botonSelec");
				$("#btn"+i).removeClass("botonSelecPerCurs");
			}
			$("#"+idBoton).addClass("botonSelec");

			//SE CARGAN NUEVAMENTE TODAS LAS NOTAS DE LAS ASIGNATURAS CURSADAS POR CADA SEMESTRE

			var repeticiones=new Array();
	    	for (var i = 1; i <= 69; i++) {
	    		repeticiones[i]=0;
	    	}

			for (var Semestre in data) {
				var NSemestres=data[Semestre].terms.length;//Numero de semestres cursados por el estudiante
				for (var i = 0; i < NSemestres; i++) {
					var Cursos=new Array();
					var Notas=new Array();
					var curso;
					var nota;
					var pga=new Array();
					var PGA=0;
					//var stateSemester=data[Semestre].courseTaken[i].state;
					var Nasignaturas=data[Semestre].terms[i].coursesTaken.length;//NUMERO DE ASIGNATURAS EN EL PERIODO SELECCIONADO
					if (1===1) {
						for (var j = 0; j < Nasignaturas; j++) {
		            		//var notaAprob=data[Semestre].courseTaken[i].Courses[j].gradeAprobation;
										var aprove = data[Semestre].terms[i].coursesTaken[j].state;
		            		curso=data[Semestre].terms[i].coursesTaken[j].name;
		               	Cursos.push(curso);
		               	nota=data[Semestre].terms[i].coursesTaken[j].grade;
		               	Notas.push(nota);
		               	//var statusCourse=data[Semestre].courseTaken[i].Courses[j].status;
		               		var semestre=data[Semestre].terms[i].semester+" "+data[Semestre].terms[i].year;
		                	PGA=PGA+(nota/Nasignaturas);
		                	//PARA ASIGNAR LAS NOTAS DEL SEMESTRE SELECCIONADO
							if(semestre==textBoton){
			               		for (var k = 1; k<=69; k++) {
									if(pestudios[k-1]==Cursos[j]){
										$("#"+k).css({"opacity":""});
										if (aprove === 'passed'){//if ((Notas[j]>=notaAprob) || (Notas[j]==0)){
												//$("#"+k).text("");
												$("#"+k).removeClass("course");
												$("#"+k).addClass("cursoSeleccionado");
										}
										else{
												$("#"+k).removeClass("course");
												//$("#"+k).text("");
												$("#"+k).addClass("cursoSeleccionado");
										}
									}
								}
							}
		            	}
				  }
			  }
			}
		});//fin de la funcion que se realiza cuando se presiona un boton
	}

	//ASIGNACION DE LOS NOMBRES DE LOS BOTONES
	$.getJSON("student.json",function(data,error){
		for (var CantSem in data) {
			var nCourses=data[CantSem].terms.length;
			//var nCourses=data[CantSem].courseTaken.length;
			for (var i = 0; i < nCourses; i++) {
				var semestre=data[CantSem].terms[i].semester;
				var año=data[CantSem].terms[i].year;
    		var periodo=semestre+" "+año;
				$("#botones").append($("<input/>",{id:"btn"+b,class:"boton",type:"button",value:periodo}));//Adicion de botones por cada semestre
				$("#btn"+b).css({"color":"blue"});
				b++;
			}
		}
		$(".boton").click(function(){
			var idBoton=$(this).attr("id");
			var textBoton=$(this).val();
			if ($(this).hasClass("botonSelec")) {
				encerarDatos();
				d3.selectAll("circle").attr("fill",function(d,i){
					if (i>=pgp.length) {return "steelblue";}
					else{return "red";}
				});
			}
			else{
				encerarDatos();
				botonclickeado(idBoton,textBoton);
			}
		});
	});
    function mostrarNombre(code,name,opc){
		var max_length = 36;
		var complete_text= code+" "+name;
		if(opc==true){
			return complete_text;
		}else{
			if(complete_text.length>=max_length){
				return complete_text.substr(0,max_length)+"...";
			}else{
				return complete_text;
			}
		}
	}
	function cargarPestudios(){//Asigna datos del plan de estudios solamente
    //ASIGNACIÓN DE NOMBRES AL ARREGLO pestudios Y DE LOS NOMBRES A LOS DIVS
		$.getJSON("ProgramStructure.json", function(data,error){
			for(var obj in data){
				var nTerms=data[obj].terms.length;
				for (var i = 0; i < nTerms; i++) {
					var nCourses=data[obj].terms[i].courses.length;
					var Area;
					for (var j = 0; j < nCourses; j++) {
						Area=data[obj].terms[i].courses[j].area;
						pestudios_credits.push(data[obj].terms[i].courses[j].credits);
						pestudios.push(data[obj].terms[i].courses[j].name);
						pestudios_codigos.push(data[obj].terms[i].courses[j].code);
					}
				}
			}
			for (var i = 1; i <=69; i++) {
				$("#"+i).addClass("course");
				//$("#"+i).empty();
				$("#"+i+" .box.a").append(mostrarNombre(pestudios_codigos[i-1],pestudios[i-1],false));
				$("#"+i).mouseover(function(){
					var id=$(this).attr("id");
					$(this).find(".box.a").empty();
					$(this).find(".box.a").append(mostrarNombre(pestudios_codigos[id-1],pestudios[id-1],true));
				});
				$("#"+i).mouseout(function(){
					var id=$(this).attr("id");
					$(this).find(".box.a").empty();
					$(this).find(".box.a").append(mostrarNombre(pestudios_codigos[id-1],pestudios[id-1],false));
				});
				$("#"+i+" .box.c").append("SCT: "+pestudios_credits[i-1]);
			}
		});
	}//FIN DE LA FUNCION CARGA PLAN DE ESTUDIOS
	$("#años").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Primer Año&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Segundo Año");
	$("#años").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tercer Año&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cuarto Año&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quinto Año");
	cargarPestudios();
	cargarDatos2();
	cargaGraficaPGA(pgp,pga);
});
