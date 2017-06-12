/**
 * Pathway is a class that will create a pathway overlay
 */
class Pathway { // eslint-disable-line
  /**
   * @param {object} options the options
   * options = { data: {<kegg ids>: {<any data>},
   *   container: <dom selector>,
   *   pathwayId: <the kegg pathway id>,
   *   tooltip: <a function that returns html string to display. param is the
   *    any data element from options.data.<kegg id>>,
   *   color: <a function that returns a color. param is the
   *    any data element from options.data.<kegg id> }
   */
  constructor(options) {
    this.options = options;
    this.options.prevData = {};
    this.keggBase = 'http://rest.kegg.jp/';
    this.getKgml();
  }
  /**
  * getKgml queries a web service to get the kgml, a xml that maps proteins and
  * molicules to an image.
  * Uses adbio to get the kgml for the pathway because rest.kegg.jp doesn't
  * support CORS.
  */
  getKgml() {
    let _this = this;
    $.ajax({
      url: 'https://adbio.pnnl.gov/bioviz/services/kgml/'+this.options.pathwayId
        .replace('map', 'hsa'),
      method: 'post',
    }).done(function(data) {
      _this.kgml = $(document.createElement('html:div'));
      _this.kgml.html(data);
      _this.initSvg();
    });
  }
  /**
  * Runs the other initialization functions
  */
  init() {
    this.initRect();
    this.initLine();
    this.initMap();
    this.initCircle();
    this.highlightData();
  }
  /**
  * Initializes the svg element and loads the image into it
  */
  initSvg() {
    let _this = this;
    let addImage = function(src) {
      let newImage = new Image();
      newImage.onload = function() {
        let height = newImage.height;
        let width = newImage.width;
        let containerWidth = $(_this.options.container).parent().width() -
          parseInt($(_this.options.container).css('padding-left')) * 2;
        _this.xScale = d3.scaleLinear()
          .range([0, containerWidth])
          .domain([0, width]);
        _this.yScale = d3.scaleLinear()
          .range([0, height*(containerWidth/width)])
          .domain([0, height]);
        _this.svg.attr('height', _this.yScale(height))
          .attr('width', _this.xScale(width))
          .insert('image', ':first-child')
          .attr('href', src)
          .attr('height', _this.yScale(height))
          .attr('width', _this.xScale(width));
        _this.init.call(_this);
      };
      newImage.src = src;
    };

    this.svg = d3.select(this.options.container || 'body')
      .append('svg');
    addImage(this.kgml.find('pathway').attr('image'));
  }
  /**
  * Initializes the rectangles found on the image and creates svg:rect around
  * them
  */
  initRect() {
    let _this = this;
    this.svg.selectAll('rect.entry')
      .data(this.kgml.find('entry[type="gene"] graphics[type="rectangle"],'
        + 'entry[type="ortholog"] graphics[type="rectangle"]'))
      .enter()
      .append('rect')
      .attr('class', 'entry')
      .attr('eid', function(d) {
        return d.parentElement.id;
      })
      .attr('name', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('x', function(d) {
        return _this.xScale(
          Math.ceil(+d.attributes.x.value - d.attributes.width.value / 2) + 1);
      })
      .attr('y', function(d) {
        return _this.yScale(
          Math.ceil(+d.attributes.y.value - d.attributes.height.value / 2));
      })
      .attr('width', function(d) {
        return _this.xScale((+d.attributes.width.value)-1);
      })
      .attr('height', function(d) {
        return _this.yScale((+d.attributes.height.value)-1);
      })
      .attr('data-variation', 'tooltip')
      .attr('data-placement', 'top')
      .attr('data-title', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('data-content', function(d) {
        return d.attributes.name.value;
      })
      .style('fill', 'transparent')
      .style('color', function(d) {
        return d.attributes.fgcolor.value;
      })
      .style('opacity', '0.6')
      .text(function(d) {
        return d.attributes.name.value;
      });
  }
  /**
  * Initializes the lines found on the image and creates svg:path around
  * them
  */
  initLine() {
    let _this = this;
    this.svg.selectAll('path.entry')
      .data(this.kgml.find('entry[type="gene"] graphics[type="line"],'
        +'entry[type="ortholog"] graphics[type="line"]'))
      .enter()
      .append('path')
      .attr('class', 'entry')
      .attr('eid', function(d) {
        return d.parentElement.id;
      })
      .attr('name', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('d', function(d) {
        let rst = 'M ';
        let coords = d.attributes.coords.value.split(',');
        let i = 0;
        while (i < coords.length) {
          if (i > 0)
            rst += 'L ';
          rst += _this.xScale(coords[i]) + ' ' + _this.yScale(coords[i + 1]);
          if (i < coords.length - 2)
            rst += ' ';
          i += 2;
        }
        return rst;
      })
      .attr('data-variation', 'tooltip')
      .attr('data-placement', 'top')
      .attr('data-title', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('data-content', function(d) {
        return d.attributes.name.value;
      })
      .style('stroke', 'white').style('fill', 'none')
      .style('stroke-width', '5').text(function(d) {
        return d.attributes.name.value;
      });
  }
  /**
  * Initializes the round rectangles found on the image and creates svg:rect
  * around them with rounded corners
  */
  initMap() {
    let _this = this;
    this.svg.selectAll('rect.roundRec')
      .data(this.kgml.find('entry[type="map"] graphics[type="roundrectangle"]'))
      .enter()
      .append('rect')
      .attr('class', 'roundRec')
      .attr('eid', function(d) {
        return d.parentElement.id;
      })
      .attr('name', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('x', function(d) {
        return _this.xScale(
          +d.attributes.x.value - d.attributes.width.value / 2);
      })
      .attr('y', function(d) {
        return _this.yScale(
          +d.attributes.y.value - d.attributes.height.value / 2);
      })
      .attr('width', function(d) {
        return _this.xScale(d.attributes.width.value);
      })
      .attr('height', function(d) {
        return _this.yScale(d.attributes.height.value);
      })
      .attr('data-variation', 'tooltip')
      .attr('data-placement', 'top')
      .attr('data-title', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('data-content', function(d) {
        return d.attributes.name.value;
      })
      .classed('entry', function(d) {
        return d.parentElement
          .attributes
          .link
          .value
          .split('?')[1]
          .indexOf('map') >= 0;
      })
      .style('fill', function(d) {
        return (d.parentElement.attributes.link.value.split('?')[1]
          .indexOf('map') >= 0) ? 'transparent' : 'none';
      }).style('color', function(d) {
        return d.attributes.fgcolor.value;
      }).text(function(d) {
        return d.attributes.name.value;
      });
  }
  /**
  * Initializes the circles found on the image and creates svg:circle around
  * them
  */
  initCircle() {
    let _this = this;
    this.svg.selectAll('circle.compound')
      .data(this.kgml.find('entry[type="compound"] graphics[type="circle"]'))
      .enter()
      .append('circle')
      .attr('class', 'compound entry')
      .attr('eid', function(d) {
        return d.parentElement.id;
      })
      .attr('name', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .attr('cx', function(d) {
        return _this.xScale(+d.attributes.x.value);
      })
      .attr('cy', function(d) {
        return _this.yScale(+d.attributes.y.value);
      })
      .attr('r', function(d) {
        return _this.xScale(d.attributes.width.value / 2);
      })
      .attr('height', function(d) {
        return _this.yScale(d.attributes.height.value / 2);
      })
      .attr('data-variation', 'tooltip')
      .attr('data-placement', 'top')
      .attr('data-content', function(d) {
        return d.attributes.name.value;
      })
      .attr('data-title', function(d) {
        return d.parentElement.attributes.name.value;
      })
      .style('fill', 'transparent')
      .style('color', function(d) {
        return d.attributes.fgcolor.value;
      })
      .text(function(d) {
        return d.attributes.name.value;
      });
  }
  /**
  * Uses passed in data to highlight the svg elements
  */
  highlightData() {
    let _this = this;
    _this.svg.selectAll('.entry')
      .filter(function(d) {
        return Object.keys(_this.options.data)
          .indexOf(d.parentElement.attributes.name.value.split(':')[1]) >=0;
      })
      .attr('data-html', function(d) {
        if(_this.options.tooltip)
          return _this.options
            .tooltip(_this.options
              .data[d.parentElement.attributes.name.value.split(':')[1]]);
        return;
      })
      // .style('fill', '#efefef')
      .style('fill', function(d) {
        if(_this.options.color)
          return _this.options
            .color(_this.options
              .data[d.parentElement.attributes.name.value.split(':')[1]]);
        return;
      });
  }
  /**
  * Clears highlights from previous data set
  */
  clearHighlight() {
    let _this = this;
    _this.svg.selectAll('.entry')
      .filter(function(d) {
        return Object.keys(_this.options.prevData)
          .indexOf(d.parentElement.attributes.name.value.split(':')[1]) >=0;
      })
      .attr('data-html', null)
      .style('fill', 'transparent');
    _this.highlightsCleared = true;
  }
  /**
  * this function allows the user to change the data
  * @param {object} data
  * @return {object}
  */
  data(data) {
    if(!data) {
      return data;
    }
    if(this.highlightsCleared) {
      this.options.prevData = this.options.data;
    } else {
      $.extend(this.options.prevData, this.options.data);
    }
    this.options.data = data;
    return this;
  }
  /**
  * This function will clear and then rehighlight the overlay
  * @return {object}
  */
  draw() {
    // clear highlights
    this.clearHighlight();
    // reapply highlights
    this.highlightData();
    return this;
  }
  /**
  * to initialize the tooltips so there is no race conditions
  */
  showTooltips() {
    // tooltips
    $(this.svg.selectAll('.entry[data-variation="tooltip"]').nodes())
      .popup({debug: true});
  }
}
