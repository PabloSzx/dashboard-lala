import * as d3 from "d3";
import originalConfig from "../../utils/config/dashboard.json";
var config;

var program;

var studentInfo;

var termsWidth;
var termsScale;

var width;
var height;

var barWidth;
var graphicPadding; //config.boxWidth * 0.1
var graphicWidth;
var graphicHeight;
var histogramScaleX;
var histogramScaleY;

var xAxis;
var yAxis;
var nestTerms;

var termSelected = "";

var nodeElement;

window.addEventListener("resize", function(event) {
  updateWindow();
});

function createGraphic(node, programStructure, studentInfoAcademic) {
  nodeElement = node;
  config = Object.assign({}, originalConfig);
  program = programStructure;
  studentInfo = studentInfoAcademic;

  if (config.autoResize) {
    autoResize(node);
  }

  termsWidth =
    config.boxWidth * config.terms + config.paddingSubjectsBox * config.terms;
  termsScale = d3
    .scaleLinear()
    .domain([1, config.terms + 1])
    .range([0, termsWidth]);

  width = termsWidth;

  barWidth = config.boxWidth * config.expandibleFactorX * 0.11;
  graphicPadding = config.boxWidth * config.expandibleFactorX * 0.12; //config.boxWidth * 0.1
  graphicWidth =
    config.boxWidth * config.expandibleFactorX - graphicPadding * 2.5;
  graphicHeight =
    (config.boxHeight * config.expandibleFactorY - config.boxHeight) * 0.3;
  histogramScaleX = d3
    .scaleLinear()
    .domain([
      config.rangeGrades[0].minGrade,
      config.rangeGrades[config.rangeGrades.length - 1].maxGrade,
    ])
    .range([0, graphicWidth]);
  histogramScaleY = d3.scaleLinear().range([graphicHeight, 0]);
  histogramScaleY.domain(config.domainGradesHistogram);
  xAxis = d3
    .axisBottom()
    .scale(histogramScaleX)
    .ticks(7);
  yAxis = d3
    .axisLeft()
    .scale(histogramScaleY)
    .ticks(4);

  nestTerms = d3
    .nest()
    .key(function(d) {
      return d.semester + "S" + d.year;
    })
    .entries(studentInfo.terms);

  let svg = d3
    .select(node)
    .append("svg")
    .attr("id", "DashboardSVG")
    .attr("width", 1)
    .attr("height", 0);

  addTermsButtons(nestTerms, 1);

  let y = parseInt(config.boxWidth * 0.3);

  // Add all the program
  program.terms.forEach(term => {
    addTerm(svg, 10, parseInt(y * 1.5), term);
  });

  // Add the student academic info
  studentInfo.terms.forEach(term => {
    term.coursesTaken.forEach(course => {
      addStudentInfoToSubject(
        course,
        term.semester + "S" + term.year,
        term.semester,
        term.year
      );
    });
  });

  addReprovedCircles();

  resizeSVG();

  function addTermsButtons(nestTerms, yPosition) {
    let terms =
      config.terms > nestTerms.length ? config.terms : nestTerms.length;
    let x = d3
      .scaleLinear()
      .domain([0.8, terms + 0.5])
      .range([0, terms * config.spacingBetweenTermsButtons]);
    let buttonWidth = parseInt(config.spacingBetweenTermsButtons / 1.3);
    let buttons = svg
      .selectAll(".botonesTerm")
      .data(nestTerms)
      .enter()
      .append("g")
      .classed("botonesTerm", true)
      .attr("clicked", "false")
      .attr("id", d => {
        return d.key;
      })
      .attr("transform", (d, i) => {
        //return `translate(${i*config.paddingBetweenTermsButtons+config.paddingBetweenTermsButtons},${yPosition})`
        return `translate(${x(i + 1) +
          config.marginLeftTermsButtons -
          buttonWidth / 2.5},${yPosition})`;
      })
      .on("click", function(d, i) {
        let ref = d3.select(this);
        svg
          .selectAll(".botonesTerm")
          .select("rect")
          .attr("stroke", config.strokeColor)
          .attr("stroke-width", config.strokeWidth);

        d3.selectAll(".psp-circle").attr("fill", function(d, i) {
          return d3.select(this).attr("originalColor");
        });

        d3
          .selectAll(".botonesTerm")
          .filter(function() {
            return ref.attr("id") != d3.select(this).attr("id");
          })
          .attr("clicked", "false");

        if (ref.attr("clicked") == "false") {
          focusSubjectsByTerm(d3.select(this).attr("id"));
          d3.select("#PSP_" + i).attr("fill", config.strokeTermSelected);
          d3
            .select(this)
            .attr("clicked", "true")
            .select("rect")
            .attr("stroke", config.strokeTermSelected)
            .attr("stroke-width", config.strokeWidthTermSelected);
          termSelected = d3.select(this).attr("id");
        } else {
          unfocusSubjectsByTerm();
          //d3.select(this).attr("clicked","false").select("text").attr("fill","black");
          d3.select("#PSP_" + i).attr("fill", function(d, i) {
            return d3.select(this).attr("originalColor");
          });
          d3
            .select(this)
            .attr("clicked", "false")
            .select("rect")
            .attr("stroke", config.strokeColor)
            .attr("stroke-width", config.strokeWidth);

          termSelected = "";
        }
      })
      .on("mouseover", function() {
        d3.select(this).style("cursor", "pointer");
      })
      .on("mouseout", function() {
        d3.select(this).style("cursor", "default");
      });

    buttons
      .append("rect")
      .attr("width", buttonWidth)
      .attr("height", buttonWidth / 2.5)
      .attr("rx", parseInt(buttonWidth / 8))
      .attr("ry", parseInt(buttonWidth / 8))
      .attr("stroke-width", config.strokeWidth)
      .attr("stroke", config.strokeColor)
      .attr("fill", config.backgroundColor);

    let fontSize = buttonWidth * 0.22;

    buttons
      .append("text")
      .text(d => {
        let text = d.key.split("S");
        return text[0] + "S " + text[1];
      })
      .attr("x", parseInt(buttonWidth * 0.1))
      .attr("y", parseInt(buttonWidth * 0.27))
      .attr("font-size", fontSize)
      .attr("fill", config.colorButtonTerm)
      /*.style("-webkit-touch-callout","none")
        .style("-webkit-user-select","none")
        .style("-khtml-user-select","none")
        .style("-moz-user-select","none")
        .style("-ms-user-select","none")
        .style("user-select","none")*/
      .classed("unselectable", true);
  }

  function autoResize(node) {
    let newboxWidth = parseInt(node.getBoundingClientRect().width / 12.5);
    let newspacingBetweenTermsButtons = parseInt(
      node.getBoundingClientRect().width / 27.81
    );
    let newboxHeight = parseInt(
      newboxWidth / (config.boxWidth / config.boxHeight)
    );
    let newtextSubjectFontSize = parseInt(
      (newboxWidth + newboxHeight) /
        ((config.boxWidth + config.boxHeight) / config.textSubjectFontSize)
    );
    let newpaddingSubjectsBox = parseInt(
      (newboxWidth + newboxHeight) /
        ((config.boxWidth + config.boxHeight) / config.paddingSubjectsBox)
    );
    let newpaddingBetweenDegress = parseInt(
      newboxWidth / (config.boxWidth / config.paddingBetweenDegress)
    );
    let newlabelDegreeTextFontSize = parseInt(
      newboxWidth / (config.boxWidth / config.labelDegreeTextFontSize)
    );
    let newhistogramLabelFontSize = parseInt(
      newboxWidth / (config.boxWidth / config.histogramLabelFontSize)
    );
    //let newpaddingBetweenTermsButtons = parseInt(newboxWidth/(config.boxWidth/config.paddingBetweenTermsButtons));
    let newtermsButtonsFontSize = parseInt(
      newboxWidth / (config.boxWidth / config.termsButtonsFontSize)
    );
    let newstrokeWidthTermSelected = parseInt(
      newboxWidth / (config.boxWidth / config.strokeWidthTermSelected)
    );
    let newtextSubjectSpacing = parseInt(
      newboxWidth / (config.boxWidth / config.textSubjectSpacing)
    );
    let factor = parseInt(node.getBoundingClientRect().width / 2.27);
    let newmarginLeftTermsButtons = parseInt(
      factor / (1100 / config.marginLeftTermsButtons)
    );
    config.boxWidth = newboxWidth;
    config.boxHeight = newboxHeight;
    config.textSubjectFontSize = newtextSubjectFontSize;
    config.paddingSubjectsBox = newpaddingSubjectsBox;
    config.paddingBetweenDegress = newpaddingBetweenDegress;
    config.labelDegreeTextFontSize = newlabelDegreeTextFontSize;
    config.histogramLabelFontSize = newhistogramLabelFontSize;
    //config.paddingBetweenTermsButtons = newpaddingBetweenTermsButtons;
    config.marginLeftTermsButtons = newmarginLeftTermsButtons;
    config.termsButtonsFontSize = newtermsButtonsFontSize;
    config.strokeWidthTermSelected = newstrokeWidthTermSelected;
    config.textSubjectSpacing = newtextSubjectSpacing;
    config.spacingBetweenTermsButtons = newspacingBetweenTermsButtons;
  }
}

function updateWindow() {
  if (config.autoResize) {
    d3.select("#DashboardSVG").remove();
    createGraphic(nodeElement, program, studentInfo, true);
  }
}

function resizeSVG() {
  let term = d3.select(".term");
  let bottomSubjects = d3.selectAll(".term").selectAll(".subject:last-child");
  let termYPosition = parseInt(term.attr("y"));

  let labelTerm = d3.selectAll(".labelTerm");

  let maxY = d3.max(bottomSubjects.nodes(), function(d) {
    let yValue = parseInt(d3.select(d).attr("y"));
    return d3.select(d).attr("expanded") == "true"
      ? yValue +
        parseInt(
          d3
            .select(d)
            .select("rect")
            .attr("height")
        ) *
          config.expandibleFactorY
      : yValue +
        parseInt(
          d3
            .select(d)
            .select("rect")
            .attr("height")
        );
  });

  let maxX = d3.max(d3.selectAll(".term").nodes(), function(d) {
    return (
      parseInt(d3.select(d).attr("x")) +
      config.boxWidth * config.expandibleFactorX
    );
  });
  d3
    .select("#DashboardSVG")
    .attr("width", Math.round(maxX + config.paddingLeft))
    .attr("height", Math.round(maxY + termYPosition + config.paddingBottom));
}

function unfocusSubjectsByTerm() {
  unfocus(d3.selectAll(".subject"), false);
  let courseSVG = d3.selectAll(`.subject.focusTerm`);
  courseSVG.attr("term", "");

  courseSVG
    .select("circle.grade")
    .attr("fill-opacity", config.gradeCircleOpacity)
    .attr("fill", d => {
      let lastDataTerm = Object.keys(d)[Object.keys(d).length - 1];
      return getGradeColor(d[lastDataTerm].grade, d[lastDataTerm].state);
    });

  courseSVG.select("text.grade").text(d => {
    let lastDataTerm = Object.keys(d)[Object.keys(d).length - 1];
    return getGradeText(d[lastDataTerm].grade, d[lastDataTerm].state);
    //return (d[lastDataTerm].grade == 0.0 && d[lastDataTerm].state === 'passed') ? 'AP': d[lastDataTerm].grade;
  });

  let nonExpandedcourseSVG = d3.selectAll(
    `.subject.focusTerm[expanded='false']`
  );
  nonExpandedcourseSVG
    .select("rect")
    .attr("stroke", config.strokeColor)
    .attr("stroke-width", config.strokeWidth)
    .attr("fill", d => {
      let lastDataTerm = Object.keys(d)[Object.keys(d).length - 1];
      return getGradeColor(d[lastDataTerm].grade, d[lastDataTerm].state);
    });

  nonExpandedcourseSVG.select("path").attr("stroke", config.strokeColor);

  nonExpandedcourseSVG.select("circle.grade").attr("visibility", "visible");

  nonExpandedcourseSVG.select("text.grade").attr("visibility", "visible");

  let ExpandedcourseSVG = d3.selectAll(`.subject.focusTerm[expanded='true']`);
  ExpandedcourseSVG.select("rect")
    .attr("stroke", config.strokeColor)
    .attr("stroke-width", config.strokeWidth / 2)
    .attr("fill", d => {
      let lastDataTerm = Object.keys(d)[Object.keys(d).length - 1];
      return getGradeColor(d[lastDataTerm].grade, d[lastDataTerm].state);
    });
  ExpandedcourseSVG.select("path").attr("stroke", config.strokeColor);

  ExpandedcourseSVG.selectAll(".histogramCohort, .histogramGroup")
    .attr("visibility", "hidden")
    .selectAll(".bar")
    //.transition()
    .attr("height", 0);
  ExpandedcourseSVG.selectAll(".histogramCohort, .histogramGroup")
    .filter(function(d, i) {
      let lastDataTerm = Object.keys(d)[Object.keys(d).length - 1];
      return d3.select(this).classed(`Semester${lastDataTerm}`);
    })
    .attr("visibility", "visible")
    .attr("transform", "scale(1,1)")
    .selectAll(".bar")
    .transition()
    .duration(config.transitionTiming)
    .attr("height", function(d, i) {
      return d3.select(this).attr("height-backup");
    });
  //.attr("height",(d,i)=>{return graphicHeight - histogramScaleY(d)});

  courseSVG.classed("focusTerm", false);
}

function focusSubjectsByTerm(termId) {
  showRequisites(null, false);
  unfocusSubjectsByTerm();
  let courseSVG = d3.selectAll(`.subject.Semester${termId}`);
  courseSVG.classed("focusTerm", true);
  courseSVG.attr("term", termId);
  courseSVG
    .select("rect")
    .attr("stroke", config.strokeTermSelected)
    .attr("stroke-width", config.strokeWidthTermSelected)
    .attr("fill", d => {
      return getGradeColor(d[termId].grade, d[termId].state);
    });
  courseSVG.select("path").attr("stroke", config.strokeTermSelected);

  courseSVG
    .select("circle.grade")
    .attr("fill-opacity", config.gradeCircleOpacity)
    .attr("fill", d => {
      return getGradeColor(d[termId].grade, d[termId].state);
    });
  courseSVG.select("text.grade").text(d => {
    return getGradeText(d[termId].grade, d[termId].state);
    //return (d[termId].grade == 0.0 && d[termId].state === 'passed') ? 'AP': d[termId].grade;
  });

  //Histograms
  let expandedcourseSVG = d3.selectAll(
    `.subject.Semester${termId}[expanded='true']`
  );
  expandedcourseSVG
    .selectAll(".histogramCohort, .histogramGroup")
    .attr("visibility", "hidden");
  expandedcourseSVG
    .selectAll(
      `.histogramCohort.Semester${termId}, .histogramGroup.Semester${termId}`
    )
    .attr("visibility", "visible")
    .attr("transform", "scale(1,1)")
    .selectAll(".bar")
    .transition()
    .duration(config.transitionTiming)
    .attr("height", function(d, i) {
      return d3.select(this).attr("height-backup");
    });
  expandedcourseSVG
    .select("rect")
    .attr("stroke", config.strokeTermSelected)
    .attr("stroke-width", config.strokeWidthTermSelected / 2);

  let nonExpandedcourseSVG = d3.selectAll(
    `.subject.Semester${termId}[expanded='false']`
  );
  nonExpandedcourseSVG.select("circle.grade").attr("visibility", "visible");
  nonExpandedcourseSVG.select("text.grade").attr("visibility", "visible");

  let unfocusSVG = d3.selectAll(`.subject`).filter(function(d, i) {
    return !d3.select(this).classed(`Semester${termId}`);
  });
  unfocus(unfocusSVG, true);
}

function unfocus(subjects, boolean) {
  if (boolean) {
    subjects.classed("unfocus", true);
    subjects.select("rect").attr("fill-opacity", function(d, i) {
      return d ? 0.2 : 0.8;
    });
    subjects.select(".reproved").attr("opacity", 0.4);
    subjects.selectAll(".credits").attr("opacity", 0.2);
    subjects.selectAll(".subejectName").attr("opacity", 0.2);
    subjects.selectAll(".grade").attr("opacity", 0.2);
    subjects
      .selectAll(".histogramGroup, .histogramCohort")
      .attr("opacity", 0.5);
  } else {
    subjects.classed("unfocus", false);
    subjects.select("rect").attr("fill-opacity", 0.9);
    subjects.select(".reproved").attr("opacity", 1);
    subjects.selectAll(".credits").attr("opacity", 1);
    subjects.selectAll(".subejectName").attr("opacity", 1);
    subjects.selectAll(".grade").attr("opacity", 1);
    subjects.selectAll(".histogramGroup, .histogramCohort").attr("opacity", 1);
  }
}

function showRequisites(course, boolean) {
  if (boolean) {
    let courseSVG = d3.selectAll(`.subject[req='true']`);
    if (!courseSVG.empty()) {
      show(courseSVG, false);
    }

    course.requisites.forEach(req => {
      let courseSVG = d3.select(`#${req.replace(/\s|:/g, "")}`);
      if (courseSVG.empty()) return;
      show(courseSVG, true);
    });
  } else {
    let courseSVG = d3.selectAll(`.subject[req='true']`);
    if (courseSVG.empty()) return;
    show(courseSVG, false);
  }

  function show(courseSVG, boolean) {
    if (boolean) {
      courseSVG.attr("req", "true");
      courseSVG
        .selectAll(".requirementText")
        .attr("visibility", "visible")
        .attr("transform", function(d, i) {
          if (courseSVG.attr("expanded") === "true") {
            let x = d3.select(this).attr("x")
              ? d3.select(this).attr("x")
              : d3.select(this).attr("cx");
            //console.log(x);
            return `translate(${config.boxWidth * 1},${-config.boxWidth / 10})`;
          }
        });
      courseSVG
        .select("rect")
        .attr("stroke", config.requirementStroke)
        .attr("stroke-width", function() {
          return courseSVG.attr("expanded") == "false"
            ? config.requirementStrokeWidth
            : config.requirementStrokeWidth / 2;
        })
        .attr("fill", config.backgroundColor);
      courseSVG.select("path").attr("visibility", "hidden");
      courseSVG.selectAll(".grade").attr("visibility", "hidden");
      courseSVG.selectAll(".reproved").attr("visibility", "hidden");
    } else {
      courseSVG.attr("req", "false");
      //If the requisite course hasnt been clicked
      courseSVG.selectAll(".requirementText").attr("visibility", "hidden");
      courseSVG
        .select("rect")
        .attr("stroke", config.strokeColor)
        .attr("stroke-width", config.strokeWidth / 2);

      courseSVG.select("path").attr("visibility", "visible");
      courseSVG.selectAll(".grade").attr("visibility", "visible");
      courseSVG.selectAll(".reproved").attr("visibility", "visible");

      courseSVG
        .select("rect")
        .attr("fill", function(d, i) {
          return d3
            .select(this.parentNode)
            .select("circle.grade")
            .attr("fill");
        })
        .attr("stroke", config.strokeColor)
        .attr("stroke-width", function() {
          return courseSVG.attr("expanded") == "false"
            ? config.strokeWidth
            : config.strokeWidth / 2;
        });
    }
  }
}

function moveSubjectsOnY(node, boolean, value) {
  let actualY = parseInt(node.attr("y"));
  let expandibleValue = config.boxHeight * value - config.boxHeight;
  d3
    .select(node.node().parentNode)
    .selectAll(".subject")
    .filter(function() {
      return parseInt(d3.select(this).attr("y")) > actualY;
    })
    .transition()
    .duration(config.transitionTiming)
    .attr("transform", function() {
      //let x = parseInt(d3.select(this).attr("x"));
      let y = parseFloat(d3.select(this).attr("y"));
      let newYPosition = boolean ? expandibleValue + y : y - expandibleValue;
      d3.select(this).attr("y", newYPosition);
      return `translate(${0},${newYPosition})`;
    });
}

function moveTermsOnX(node, boolean) {
  let actualX = parseInt(d3.select(node.node().parentNode).attr("x"));
  let expandibleValue =
    config.boxWidth * config.expandibleFactorX - config.boxWidth;

  //Check if there are subjects in the term clicked, expanded.
  let expandedSubjects = d3
    .select(node.node().parentNode)
    .selectAll("[expanded=true]");

  // Solo se desplazan a la derecha si al querer expandir una materia
  // en el termino al que pertenece no existen otras materias que se hayan expandido,
  // y solo se desplaza a la izquierda si al querer contraer la materia
  // es la unica expandida
  if (
    !(
      (boolean && expandedSubjects.empty()) ||
      (!boolean && expandedSubjects.size() === 1)
    )
  ) {
    return;
  }
  d3
    .select(node.node().parentNode.parentNode)
    .selectAll(".term, .labelTerm")
    .filter(function() {
      return parseInt(d3.select(this).attr("x")) > actualX;
    })
    .transition()
    .duration(config.transitionTiming)
    .attr("transform", function() {
      let y = parseInt(d3.select(this).attr("y"));
      let x = parseInt(d3.select(this).attr("x"));
      let newXPosition = boolean ? x + expandibleValue : x - expandibleValue;
      d3.select(this).attr("x", newXPosition);
      return `translate(${newXPosition},${y})`;
    });

  /*  d3.select(node.node().parentNode.parentNode).selectAll(".labelTerm")
      .filter(function(){return parseInt(d3.select(this).attr("x"))>actualX;})
      .select("rect")
      .transition()
      .duration(config.transitionTiming)
      .attr("transform",function(){
        /*  let y = parseInt(d3.select(this).attr("y"));
          let x = parseInt(d3.select(this).attr("x"));
          let newXPosition = (boolean)?x+expandibleValue:x-expandibleValue;
          d3.select(this).attr("x",newXPosition)
          return `translate(${newXPosition},${y})`;*/
  //return "scale(1,1.5)"
  //})
}

function focusSubject(node, boolean) {
  if (boolean) {
    unfocus(d3.selectAll(".subject"), false);

    let subjects = d3.selectAll(".subject[req='false']").filter(function(d, i) {
      return node.attr("id") != d3.select(this).attr("id");
    });

    unfocus(subjects, boolean);
  } else {
    unfocus(d3.selectAll(".subject"), boolean);
  }
}

function showHistogram(node, show) {
  let actualY = parseInt(node.attr("y"));
  let actualX = parseInt(node.attr("x"));
  let activeTerm = node.attr("term");
  // If there is not data in the element, is a subject the student has not taken
  let expandibleFactor = !node.data()[0]
    ? parseInt(config.expandibleFactorY / 1.5)
    : config.expandibleFactorY;

  moveSubjectsOnY(node, show, expandibleFactor);
  moveTermsOnX(node, show);

  if (show) {
    node.selectAll(".hiddenElements").attr("visibility", "hidden");

    node
      .select("rect")
      .transition()
      .duration(config.transitionTiming)
      .attr(
        "transform",
        `scale(${config.expandibleFactorX},${expandibleFactor})`
      )
      .attr("stroke-width", config.strokeWidth / 2);
    //.attr("fill",config.backgroundColor);
    node
      .select("path")
      .transition()
      .duration(config.transitionTiming)
      .attr(
        "transform",
        `scale(${config.expandibleFactorX + 0.2},${expandibleFactor})`
      );

    node
      .selectAll(".gradeText,.reproved")
      .transition()
      .duration(config.transitionTiming)
      .attr("transform", `translate(${config.boxWidth - 2},${0})`);
    //Shows the graphics
    let histogramsCohort = node.selectAll(".histogramCohort");
    let histogramsGroup = node.selectAll(".histogramGroup");

    histogramsCohort
      .filter(function(d, i) {
        if (activeTerm == "") return i + 1 === histogramsCohort.size(); // Shows the last histogram if there are more
        return d3.select(this).classed(`Semester${activeTerm}`);
      })
      .transition()
      .duration(config.transitionTiming)
      .attr("visibility", "visible")
      .attr("transform", `scale(${1},${1})`)
      .selectAll(".bar")
      //.transition().delay(-250)
      .attr("height", function(d, i) {
        return d3.select(this).attr("height-backup");
      });
    //.attr("height",(d,i)=>{return graphicHeight - histogramScaleY(d)});

    histogramsGroup
      .filter(function(d, i) {
        if (activeTerm == "") return i + 1 === histogramsGroup.size(); // Shows the last histogram if there are more
        return d3.select(this).classed(`Semester${activeTerm}`);
      })
      .transition()
      .duration(config.transitionTiming)
      .attr("visibility", "visible")
      .attr("transform", `scale(${1},${1})`)
      .selectAll(".bar")
      //   .transition().delay(-250)
      .attr("height", function(d, i) {
        return d3.select(this).attr("height-backup");
      });
    //   .attr("height",(d,i)=>{return graphicHeight - histogramScaleY(d)});
  } else {
    if (node.attr("req") == "false") {
      node.selectAll(".hiddenElements").attr("visibility", "visible");

      node
        .select("rect")
        .transition()
        .duration(config.transitionTiming)
        .attr("transform", "scale(1,1)")
        .attr("fill", node.select("circle.grade").attr("fill"))
        .attr("stroke-width", config.strokeWidth);

      node
        .select("path")
        .transition()
        .duration(config.transitionTiming)
        .attr("transform", "scale(1,1)");

      node
        .selectAll(".gradeText,.reproved")
        .transition()
        .duration(config.transitionTiming)
        .attr("transform", `translate(${0},${0})`);
    } else {
      node
        .select("rect")
        .transition()
        .duration(config.transitionTiming)
        .attr("transform", "scale(1,1)")
        .attr("fill", config.backgroundColor);
    }
    //Shows the graphics

    node
      .selectAll(".histogramCohort, .histogramGroup")
      .transition()
      .duration(config.transitionTiming)
      .attr("transform", `scale(0,0)`)
      .transition()
      .attr("visibility", "hidden")
      .selectAll(".bar")
      .attr("height", 0);
  }
}

function addTerm(node, xPosition, yPosition, term) {
  let semester = term.position;
  let x = termsScale(semester);

  let termSVG = node
    .append("g")
    .attr("id", `${config.semesterIdentifier}${semester}`)
    .attr("class", "term")
    .attr("transform", `translate(${x + xPosition},${yPosition})`)
    .attr("x", x + xPosition)
    .attr("y", yPosition);

  termSVG
    .append("text")
    .attr("x", config.boxWidth * 0.45)
    .attr("font-size", config.boxWidth * 0.12)
    .attr("font-weight", "bold")
    .attr("fill", config.colorLabelTerm)
    .text(config.labelTermArray[semester - 1]);

  let newYPosition = 10;

  term.courses.forEach((course, i) => {
    addSubject(
      termSVG,
      0,
      newYPosition,
      config.boxWidth,
      config.boxHeight,
      course
    );
    newYPosition = newYPosition + config.boxHeight + config.paddingSubjectsBox;
  });
}

function addSubject(node, x, y, width, height, course) {
  const bandWidth = width * 0.18;
  const gradeCircleSize = width * 0.09;
  const gradeFontSize = width * 0.09;
  let g = node
    .append("g")
    .attr("transform", `translate(${x},${y})`)
    .attr("id", course.code.replace(/\s|:/g, ""))
    .attr("class", "subject")
    .attr("term", "")
    .attr("x", x)
    .attr("y", y)
    .attr("expanded", "false")
    .attr("req", "false")
    .on("click", function(d, i) {
      onclick(d3.select(this), course);
    })
    .on("mouseover", function() {
      d3.select(this).style("cursor", "pointer");
    })
    .on("mouseout", function() {
      d3.select(this).style("cursor", "default");
    });

  // Subject box
  g
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("rx", config.borderRadious)
    .attr("ry", config.borderRadious)
    .attr("fill", config.backgroundColor)
    .attr("fill-opacity", config.bandColorOpacity)
    .attr("stroke-width", config.strokeWidth)
    .attr("stroke", config.strokeColor);

  g
    .append("path")
    //.attr("class",'hiddenElements')
    .attr("stroke", config.strokeColor)
    .attr("stroke-width", config.strokeWidth / 2)
    .attr("fill", config.backgroundColor)
    .attr("d", () => {
      return `M${config.borderRadious},0 H${width -
        bandWidth} V${height} H${config.borderRadious} A${config.borderRadious},${config.borderRadious} 0 0 1 0,${height -
        config.borderRadious} V${config.borderRadious} A${config.borderRadious},${config.borderRadious} 0 0 1 ${config.borderRadious},0 Z`;
    });

  // Creditos
  g
    .append("text")
    .attr("class", "credits hiddenElements")
    .attr("x", config.textSubjectPadding * 2)
    .attr("y", height - height * 0.15)
    .attr("font-size", config.textSubjectFontSize)
    .attr("font-weight", config.gradeFontWeight)
    .classed("unselectable", true)
    .text(`${config.creditsLabel}${course.credits}`);

  // Subject name
  let subjectText = g.append("text").attr("class", "subejectName");
  wrapText(
    subjectText,
    config.textSubjectSpacing,
    width - bandWidth - config.textSubjectPadding * 2,
    config.textSubjectPadding,
    config.textSubjectPadding,
    config.textSubjectFontSize,
    config.textSubjectFontWeight,
    course.name
  );

  // Grade label
  g
    .append("circle")
    .attr("class", "grade")
    .attr("fill-opacity", 0)
    .attr("cx", width - gradeCircleSize)
    .attr("cy", gradeCircleSize)
    .attr("fill", config.backgroundColor)
    .attr("r", gradeCircleSize)
    .attr("visibility", "hidden");

  g
    .append("text")
    .attr("class", "gradeText grade")
    .attr("x", width - gradeCircleSize - gradeFontSize / 1.5)
    .attr("y", gradeCircleSize + gradeFontSize / 2.8)
    .attr("font-size", gradeFontSize)
    .attr("font-weight", config.gradeFontWeight)
    .classed("unselectable", true)
    .attr("visibility", "hidden");

  // Requirement label
  g
    .append("circle")
    .attr("stroke", config.requirementStroke)
    .attr("class", "requirementText")
    .attr("cx", width - bandWidth * 2)
    .attr("cy", height - gradeCircleSize * 2)
    .attr("fill", config.requirementBackground)
    .attr("r", gradeCircleSize)
    .attr("visibility", "hidden");

  g
    .append("text")
    .attr("class", "requirementText")
    .attr("x", width - bandWidth * 2 - gradeFontSize / 1.2)
    .attr("y", height - gradeCircleSize * 2 + gradeFontSize / 2.8)
    .attr("font-size", gradeFontSize - 2)
    .attr("font-weight", "bold")
    .attr("fill", config.requirementStroke)
    .attr("visibility", "hidden")
    .classed("unselectable", true)
    .text("Req");

  let distributionGroup =
    course.historicGroup == null || course.historicGroup.distribution == null
      ? []
      : course.historicGroup.distribution.map(element => {
          return element.value;
        });

  addHistogram(
    g,
    config.boxHeight * 0.9,
    "histogramGroup",
    `programHistory`,
    distributionGroup,
    0,
    "Calificaciones históricas"
  );

  function onclick(nodeCourse, course) {
    //if (!nodeCourse.data()[0]) return;

    //Si hago click sobre una materia perteneciente a un termino especifico

    d3
      .selectAll(`.botonesTerm:not([id='${termSelected}'])`)
      .select("rect")
      .attr("stroke", config.strokeColor)
      .attr("stroke-width", config.strokeWidth);

    d3.selectAll(".psp-circle").attr("fill", function(d, i) {
      return d3.select(this).attr("originalColor");
    });

    if (nodeCourse.attr("term") == "") {
      unfocusSubjectsByTerm();
      termSelected = "";
      d3.selectAll(".botonesTerm").attr("clicked", "false");
    }
    //d3.select(this.parentNode).moveToFront();

    if (nodeCourse.attr("expanded") == "false") {
      showRequisites(course, true);
      showHistogram(nodeCourse, true);
      focusSubject(nodeCourse, true);
      nodeCourse.attr("expanded", "true");

      //Just for subjects with student info
      if (nodeCourse.data()[0]) {
        let terms = Object.keys(nodeCourse.data()[0]);
        d3
          .selectAll(".botonesTerm")
          .filter(function() {
            return terms.includes(d3.select(this).attr("id"));
          })
          .select("rect")
          .attr("stroke", config.strokeTermSelected)
          .attr("stroke-width", config.strokeWidthTermSelected);
      }
    } else {
      showRequisites(course, false);
      showHistogram(nodeCourse, false);
      focusSubject(nodeCourse, false);
      if (termSelected != "") focusSubjectsByTerm(termSelected);

      nodeCourse.attr("expanded", "false");
    }

    resizeSVG();
  }
}

function addHistogram(node, y, className, term, distribution, grade, title) {
  histogramScaleY.domain([1, d3.max(distribution)]);
  yAxis = d3
    .axisLeft()
    .scale(histogramScaleY)
    .ticks(4);
  if (title == "General")
    yAxis.tickFormat(function(d, i) {
      return d + "%";
    });
  //console.log(distribution);
  let graphic = node
    .append("g")
    .attr("transform", `translate(${graphicPadding},${y})`);

  let g = graphic
    .append("g")
    .attr("visibility", "hidden")
    .attr("class", `${className} ${term}`)
    .attr("transform", "scale(0,0)");

  let barWidthXaxis = config.boxWidth / 35;

  g
    .append("text")
    .attr("y", -barWidthXaxis * 3.0)
    .attr("x", 0)
    .attr("font-size", config.histogramLabelFontSize)
    .attr("font-weight", "bold")
    .text(title);
  let xAxisSvg = g.append("g").call(xAxis);
  xAxisSvg.attr(
    "transform",
    `translate(${barWidthXaxis},${graphicHeight + barWidthXaxis})`
  );
  xAxisSvg.select("path").attr("visibility", "hidden");
  xAxisSvg
    .selectAll(".tick")
    .select("line")
    .attr("visibility", "hidden");
  xAxisSvg
    .append("rect")
    .attr("fill", "red")
    .attr("width", 50);

  g
    .append("g")
    .call(yAxis)
    .select("path")
    .attr("visibility", "hidden");

  g
    .selectAll(".tick")
    .selectAll("text")
    .attr("font-size", config.histogramLabelFontSize);

  g
    .selectAll(".bar")
    .data(distribution)
    .enter()
    .append("rect")
    .classed("bar", true)
    .attr("x", (d, i) => {
      return histogramScaleX(i + 1) + barWidthXaxis;
    })
    .attr("y", (d, i) => {
      return histogramScaleY(d);
    })
    .attr("fill", (d, i) => {
      if (i + 1 == Math.floor(grade)) {
        return config.backgroundColorBarsSelected;
      } else {
        return config.backgroundColorBars;
      }
    })
    .attr("width", barWidth)
    .attr("height", 0)
    .attr("height-backup", (d, i) => {
      return graphicHeight - histogramScaleY(d) < 0
        ? 0
        : graphicHeight - histogramScaleY(d);
    });

  config.rangeGrades.forEach(function(d, i) {
    let x1 = d.minGrade;
    let x2 =
      i === config.rangeGrades.length - 1
        ? d.maxGrade
        : config.rangeGrades[i + 1].minGrade;
    xAxisSvg
      .append("rect")
      .attr("fill", d.color)
      .attr("width", histogramScaleX(x2) - histogramScaleX(x1))
      .attr("height", barWidthXaxis)
      .attr("x", histogramScaleX(x1));
  });

  if (!config.showHistogramLine) return;
  // Add lines
  let lineData = distribution.map(function(d, i) {
    return {
      x: histogramScaleX(i + 1 + 0.5) + barWidthXaxis,
      y: histogramScaleY(d),
    };
  });

  var lineFunction = d3
    .line()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    })
    .curve(d3.curveMonotoneX); // apply smoothing to the line

  g
    .append("path")
    .attr("d", lineFunction(lineData))
    .attr("stroke", config.histogramLineColor)
    .attr("stroke-width", config.strokeWidth)
    .attr("stroke-opacity", 0.7)
    .attr("fill", "none");

  // Add circles
  g
    .selectAll(".circle")
    .data(distribution)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => {
      return histogramScaleX(i + 1 + 0.5) + barWidthXaxis;
    })
    .attr("cy", (d, i) => {
      return histogramScaleY(d);
    })
    .attr("r", Math.floor(config.boxWidth / 48.3))
    .attr("fill", config.histogramLineColor);
}

function addStudentInfoToSubject(course, termId, semester, year) {
  let courseSVG = d3.select(`#${course.code.replace(/\s|:/g, "")}`);
  if (courseSVG.empty()) return;
  courseSVG.select(".programHistory").remove();
  let grade = course.grade.toFixed(1); // Rounded to one decimal

  //Binding data
  let data = {};
  if (courseSVG.data()[0]) {
    data = courseSVG.data()[0];
  }
  data[termId] = { grade: grade, state: course.state };
  courseSVG.data([data]).enter();
  courseSVG.classed(`Semester${termId}`, true).attr("term", "");

  courseSVG
    .select("circle.grade")
    .attr("visibility", "visible")
    .attr("fill-opacity", config.gradeCircleOpacity)
    .attr("fill", d => {
      return getGradeColor(grade, course.state);
    });
  courseSVG
    .select("text.grade")
    .attr("visibility", "visible")
    .text(() => {
      return getGradeText(grade, course.state);
    });

  courseSVG.select("rect").attr("fill", () => {
    return getGradeColor(grade, course.state);
  });

  // Add cohort

  let distributionCohort =
    course.classGroup == null || course.classGroup.distribution == null
      ? []
      : course.classGroup.distribution.map(element => {
          return element.value;
        });
  addHistogram(
    courseSVG,
    config.boxHeight * 0.8,
    "histogramCohort",
    `Semester${termId}`,
    distributionCohort,
    grade,
    `Calificaciones ${semester} ${year}`
  );

  let distributionGroup =
    course.historicGroup == null || course.historicGroup.distribution == null
      ? []
      : course.historicGroup.distribution.map(element => {
          return element.value;
        });

  addHistogram(
    courseSVG,
    config.boxHeight * 2.05,
    "histogramGroup",
    `Semester${termId}`,
    distributionGroup,
    grade,
    "Calificaciones históricas"
  );
}

function addReprovedCircles() {
  const width = config.boxWidth;
  const bandWidth = width * 0.18;
  const gradeCircleSize = width * 0.038;
  const padding = config.boxHeight * 0.2;
  d3
    .selectAll(".subject")
    .filter(function() {
      //Subjects which the studendt took more than once
      let data = d3.select(this).data()[0];
      return data && Object.keys(data).length > 1;
    })
    .append("g")
    .classed("reproved", true)
    //.classed("hiddenElements",true)
    .selectAll("circle")
    .data(function() {
      let data = d3.select(this).data()[0];
      let array = Object.keys(data);
      array.pop();
      return array.map(function(d) {
        return data[d];
      });
    })
    .enter()
    .append("circle")
    .attr("r", gradeCircleSize)
    .attr("cx", width - bandWidth + gradeCircleSize * 2.5)
    .attr("cy", function(d, i) {
      return padding + (gradeCircleSize * 2 * i + gradeCircleSize + 5) + 3 * i;
    })
    .attr("fill", function(d, i) {
      return getGradeColor(d.grade, d.state);
    })
    .attr("stroke", config.reprovedCirclesStrokeColor);

  d3.selectAll(".subject").filter(function() {
    //Subjects which the studendt took more than once
    let data = d3.select(this).data()[0];
    //  console.log(data);
  });
}

function wrapText(node, padding, width, x, y, fontSize, fontWeight, text) {
  let w = width;
  let words = text.split(" ");
  let tspan = node
    .append("tspan")
    .attr("x", x + padding)
    .attr("y", y + padding + fontSize)
    .attr("font-size", fontSize)
    .attr("font-weight", fontWeight)
    .classed("unselectable", true)
    .text(words[0]);
  let j = 1;
  for (var i = 1; i < words.length; i++) {
    let oldText = tspan.text();
    let len = oldText.length;
    tspan.text(`${oldText} ${words[i]}`);

    if (tspan.node().getComputedTextLength() > w - padding) {
      j = j + 1;
      tspan.text(tspan.text().slice(0, len));
      tspan = node
        .append("tspan")
        .attr("x", x + padding)
        .attr("y", y + padding * j + fontSize * j)
        .attr("font-size", fontSize)
        .attr("font-weight", fontWeight)
        .classed("unselectable", true)
        .text(words[i]);
    }
  }
}

function getGradeText(grade, status) {
  if (grade == 0.0) {
    if (status === "A") {
      return "AP";
    } else if (status === "R") {
      return "RP";
    } else if (status === "N") {
      return "AN";
    }
  } else {
    return grade;
  }
}

function getGradeColor(grade, status) {
  //Special situation
  if (grade == 0.0 && status === "A")
    return config.rangeGrades[config.rangeGrades.length - 1].color;
  else if (grade == 0.0 && status === "R") return config.rangeGrades[0].color;
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  let color = "white";
  config.rangeGrades.forEach(range => {
    color =
      grade >= range.minGrade && grade <= range.maxGrade ? range.color : color;
  });
  return color;
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

export default {
  createGraphic: createGraphic,
};
