const githubRepositoryBase = 'https://raw.githubusercontent.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS/master/';
/**
* Event handler for when an error occurs when loading a strcuture image from
* PubChem. If error occurs during downloading image it will wait .5 seconds then
* try again. If another error occurs it will load a default "not found" image.
* @param {object} img The image element.
*/
function imageError(img) { // eslint-disable-line no-unused-vars
  if(img.imgError) {
    clearTimeout(img.imgError);
    img.onerror=null;
    img.src= githubRepositoryBase + 'metaboliteResources/images/default.jpg';
  } else {
    img.imgError = setTimeout(function() {
      img.src = img.src+'?'+ new Date().getTime();
    }, 500);
  }
}
$(document).ready(function() {
  // map column headers to display format
  let columns = {
    'class': 'class',
    'subclass': 'Subclass',
    'name': 'Name',
    'Neutral Name': 'Neutral Name',
    'cas': 'CAS Number',
    'formula': 'Formula',
    'mass': 'Exact Mass',
    'mPlusH': '[M+H]<sup>+</sup>',
    'mPlusHCCS': 'Average_[M+H]<sup>+</sup>',
    'mPlusHRsd': 'RSD_[M+H]<sup>+</sup>',
    'mPlusNa': '[M+Na]<sup>+</sup>',
    'mPlusNaCCS': 'Average_[M+Na]<sup>+</sup>',
    'mPlusNaRsd': 'RSD_[M+Na]<sup>+</sup>',
    'mPlusK': '[M+K]<sup>+</sup>',
    'mPlusKCCS': 'Average_[M+K]<sup>+</sup>',
    'mPlusKRsd': 'RSD_[M+K]<sup>+</sup>',
    'mMinusH': '[M-H]<sup>-</sup>',
    'mMinusHCCS': 'Average_[M-H]<sup>-</sup>',
    'mMinusHRsd': 'RSD_[M-H]<sup>-</sup>',
    'mPlusDot': '[M<sup>&#x2022;</sup>]<sup>+</sup>',
    'mPlusDotCCS': 'Average_[M&#x2022;]<sup>+</sup>',
    'mPlusDotRsd': 'RSD_[M<sup>&#x2022;</sup>]<sup>+</sup>',
    'mPlus': '[M]<sup>+</sup>',
    'mPlusCCS': 'Average_[M]<sup>+</sup>',
    'mPlusRsd': 'RSD_[M]<sup>+</sup>',
    'CCS': '<sup>DT</sup>CCS<sub>N<sub>2</sub></sub>(&#x212B<sup>2</sup>)',
    'structure': 'Structure',
  };

  /**
  * parses a string to a 2 decimal precision float or string "N/A".
  * @param {string} num float number as string.
  * @return {string} The string form of num with 2 decimal precision.
  */
  function parseNumber(num) {
    let result = parseFloat(num).toFixed(2);
    if (isNaN(result))
      result = 'N/A';
    return result;
  }
  /**
  * Checks if at least one collision cross section of the object is available.
  * @param {object} d Data object from table.
  * @return {boolean} True if at least one valid number is available in object.
  */
  function isCcsAvailable(d) {
    if(isNaN(parseFloat(d.mPlusHCCS)) &&
      isNaN(parseFloat(d.mPlusNaCCS)) &&
      isNaN(parseFloat(d.mMinusHCCS)) &&
      isNaN(parseFloat(d.mPlusKCCS)) &&
      isNaN(parseFloat(d.mPlusCCS)) &&
      isNaN(parseFloat(d.mPlusDotCCS)))
        return false;
    return true;
  }
  /**
  * Used with filter function to remove duplicates from array.
  * @param {object} item Current item in array.
  * @param {int} pos Current position in array
  * @param {array} arr the array removeDups is being used on.
  * @return {boolean} True if item is at the current index, flase otherwise.
  */
  function removeDups(item, pos, arr) {
      return arr.indexOf(item) == pos;
  }
  /**
  * Used with sort function to sort an array in ascending order.
  * @param {string} a current string.
  * @param {int} b other string
  * @return {int} True if item is at the current index, flase otherwise.
  */
  function sortStringArrayAsc(a, b) {
    return a==b?0:a>b?1:-1;
  }
  /**
  * Formats ccs information for display
  * @param {string} display The adduct as a string
  * @param {float} value The value of the ccs
  * @return {string} the proper display or an empty string
  */
  function ccsString(display, value) {
    if(value)
      return display + ': ' + parseNumber(value) + '<br>';
    return '';
  }
  /**
  * Formats collision cross section for display in table cell.
  * @param {object} d Data object from table.
  * @return {string} the collision cross section formated for display
  */
  function getCCS(d) {
    return ccsString(columns.mPlusH, d.mPlusHCCS)
      + ccsString(columns.mPlusNa, d.mPlusNaCCS)
      + ccsString(columns.mMinusH, d.mMinusHCCS)
      + ccsString(columns.mPlusK, d.mPlusKCCS)
      // + ccsString(columns.mPlus, d.mPlusCCS)
      + ccsString(columns.mPlusDot, d.mPlusDotCCS);
  }
  /**
  * Used with filter function to remove elements from array that don't have a
  * collision cross section.
  * @param {object} d Current item in array.
  * @return {boolean} True if property of ccsFound is true, flase otherwise.
  */
  function hasCCS(d) {
    return d.ccsFound;
  }
  /**
  * Used with map function to create an array of strings from class property in
  * all object.
  * @param {object} d Data object from table.
  * @return {string} string from class property in object.
  */
  function mapClasses(d) {
    return d.class;
  }
  /**
  * Used with map function to create an array of strings from subclass property
  * in all object.
  * @param {object} d Data object from table.
  * @return {string} string from subclass property in object.
  */
  function mapSubclasses(d) {
    return d.subclass;
  }
  /**
  * Used with map function to create an array of strings from kegg property in
  * all object.
  * @param {object} d Data object from table.
  * @return {string} string from kegg property in object.
  */
  function mapCompounds(d) {
    return d.kegg;
  }
  /**
  * Used to select elements from the tsv to filter unused properties out.
  * This allows the tsv to be changed and remapping of the headers so the
  * variable in the next function don't need to be changed.
  * @param {object} d each row in the tsv.
  * @return {object} the object that is used in the next function.
  */
  function processTsv(d) {
    // determins the object returned from processing the tsv data file
    let structureImage = '<img class="ui small image structureImage"'
      +'src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/'
      + (d.cid && d.cid.length > 0
        ? 'cid/' + d.cid : 'name/' + encodeURIComponent(d['Neutral Name']))
        + '/PNG" alt="image not found" onerror="imageError(this)"/>';
    return {
      class: d.main_class,
      subclass: d.subclass || 'N/A',
      kegg: d.kegg,
      name: d['Neutral Name'],
      cas: d.cas,
      formula: d.formula,
      structure: structureImage,
      mass: d.mass,
      CCS: getCCS(d),
      ccsFound: isCcsAvailable(d),
    };
  }
  // include moleWeightCalc.js in script to calculate the mass from formula
  let MWC = new MolecularWeightCalculator();
  let pathwayModal;
  // parses the tsv data file
  d3.tsv(githubRepositoryBase+'data/metabolitedata.tsv',
    processTsv,
    function(err, d) {
    // if there's an error with reading the file, display the error and stop
    // processing the page.
    if (err) {
      console.log(err);
      return;
    }
    // filter out entries that don't have a collision cross section
    d = d.filter(hasCCS);
    // create class and subclass list for use with filters
    let classes = d.map(mapClasses)
      .filter(removeDups);
    classes.sort(sortStringArrayAsc);
    let subclasses = d.map(mapSubclasses)
      .filter(removeDups);
    subclasses.sort(sortStringArrayAsc);
    let compounds = d.map(mapCompounds)
      .filter(removeDups);
    let columnIds = d.columns;
    delete d.columns;
    // map array of headers into format for datatables
    columnIds = ['class', 'subclass', 'kegg', 'name', 'cas', 'formula',
      'structure', 'mass', 'CCS']
    .map(function(e) {
      return {
        title: columns[e],
        data: e,
      };
    });
    // creates a datatable with tsv data file
    let table = $('#tablecontainer').DataTable({ // eslint-disable-line
      columns: columnIds,
      deferRender: true,
      fixedHeader: true,
      dom: '<"#pathwayMenu.ui top attached borderless menu"<"item"<"'
        +'#pathwayFilter.ui search selection dropdown">>><"ui attached '
        +'borderless menu"<"right menu"<"item"<"#classFilter.ui multiple search'
        +' selection dropdown">><"item"<"#subclassFilter.ui multiple search '
        +'selection dropdown">><"item"f>>><"ui attached segment"t><"ui bottom '
        +'attached borderless menu"<"item"l><"item"i><"right menu"<"item"p>>>',
      data: d,
      columnDefs: [{
          visible: false,
          targets: [0, 1, 2],
        },
        {
          width: 150,
          targets: 8,
        },
        {
          orderable: false,
          targets: 6,
        },
      ],
      order: [
        [0, 'asc'],
        [1, 'asc'],
      ],
      drawCallback: function(settings) {
        // draw a class and subclass row when applicable
        let api = this.api();
        let rows = api.rows({
          page: 'current',
        }).nodes();
        let last = null;
        api.column(0, {
          page: 'current',
        }).data()
        .each(function(group, i) {
          if (last !== group) {
            $(rows).eq(i).before(
              '<tr class="group"><td colspan="6"><div class="ui mini teal '
              +'ribbon label">Class</div>' + group + '</td></tr>'
            );
            last = group;
          }
        });
        api.column(1, {
          page: 'current',
        }).data()
        .each(function(group, i) {
          if (last !== group) {
            $(rows).eq(i).before(
              '<tr class="sub_group"><td colspan="6"><div class="ui mini teal '
              +'ribbon label">Subclass</div>'
              + group + '</td></tr>'
            );
            last = group;
          }
        });
      },
    });
    // Order by the class when clicked
    $('#tablecontainer tbody').on('click', 'tr.group', function() {
      let ordering = table.order();
      let currentOrderClass;
      let currentOrderSubclass;
      if(ordering.length > 1) {
        currentOrderClass = table.order()[0];
        currentOrderSubclass = table.order()[1];
        if (currentOrderClass[0] === 0 && currentOrderClass[1] === 'asc') {
          table.order([0, 'desc'], currentOrderSubclass)
            .draw();
        } else {
          table.order([0, 'asc'], currentOrderSubclass)
            .draw();
        }
      } else {
        table.order([0, 'asc'], [0, 'asc'])
          .draw();
      }
    });
    // Order by the subclass when clicked
    $('#tablecontainer tbody').on('click', 'tr.sub_group', function() {
      let ordering = table.order();
      let currentOrderClass;
      let currentOrderSubclass;
      if(ordering.length > 1) {
        currentOrderClass = table.order()[0];
        currentOrderSubclass = table.order()[1];
        if (currentOrderSubclass[0] === 1
          && currentOrderSubclass[1] === 'asc') {
          table.order(currentOrderClass, [1, 'desc'])
            .draw();
        } else {
          table.order(currentOrderClass, [1, 'asc'])
            .draw();
        }
      } else {
        table.order([0, 'asc'], [1, 'asc'])
          .draw();
      }
    });
    table.$('tr').each(function() {
      this.setAttribute('data-content',
       MWC.weight(table.cell(this._DT_RowIndex, 5)
       .data()));
      this.setAttribute('data-variation', 'basic');
    });
    // debug information when in dev environement
    if(window.location.href.indexOf('localhost')>=0) {
      table.$('tr').on('mouseover', function() {
        $(this).popup('show');
      }).on('mouseout', function() {
        $(this).popup('hide');
      });
    }

    /* eslint no-extend-native:0*/
    /**
    * Used to check if element from arr is in this array.
    * @param {array} arr array.
    * @return {boolean} true if element in arr found in this array, false
    * otherwise.
    */
    Array.prototype.in = function(arr) {
      for(let a in arr) {
        if(this.indexOf(arr[a])>=0)
          return true;
      }
      return false;
    };

    let compoundList;

    // read compound list file
    $.ajax({
      url: githubRepositoryBase + 'metaboliteResources/compoundList.json',
      dataType: 'json',
    }).done(function(d) {
      compoundList = d;
      // read pathway list file
      $.ajax({
        url: githubRepositoryBase + 'metaboliteResources/pathwayList.txt',
      }).done(function(data) {
        // load pathway modal when pathway button clicked
        $('#pathwayMenu')
          .append('<a id="pathway_btn" class="item">Show Pathway</a>')
          .find('#pathway_btn')
          .on('click', function(evt) {
          // show modal
          $('#pathway_modal').modal('show');
          // if pathwayModal exists reinitialize tooltips
          pathwayModal && pathwayModal.showTooltips();
        });
        data = data.split('\n')
          .filter(function(line) {
            return line.length>0;
          }).map(function(line) {
            let elements = line.split('\t');
            return {
              path: elements[0].split(':')[1],
              name: elements[1],
            };
          });
        data.sort(function(a, b) {
          return a.name==b.name?0:a.name>b.name?1:-1;
        });

        data = data.filter(function(d) {
          return compoundList[d.path].length>0
            && compoundList[d.path].in(compounds);
        });
        let pathwayMap = data.reduce(function(a, d) {
          if(!a.hasOwnProperty(d.path))
            a[d.path] = d.name;
          return a;
        }, {});
        data = [
          {path: '', name: 'No Pathway Filter'},
          {path: 'missing', name: 'KEGG ID Unknown'},
        ].concat(data);
        // append pathway list to pathway filter dropdown
        $('#pathwayFilter').append(
          '<input type="hidden" name="class">'
          +'<div class="default text">Pathway</div>'
          +'<i class="dropdown icon"></i>'
          +'<div class="menu">'
          + data.map(function(e) {
            return '<div class="item" data-value="'+e.path+'">'+e.name+'</div>';
          }).join('')
          +'</div>'
        ).dropdown({
          onChange: function(value, text, $selectedItem) {
            if(value == 'missing') {
              table.column(2)
                .search('^$', true, false)
                .draw();
            } else {
              table.column(2)
                .search(compoundList[value].join('|'), true, false)
                .draw();
            }
            let filteredData = table.rows({filter: 'applied'}).data();
            let subclass = [];
            let mainClass = [];
            filteredData.each(function(d) {
              if(subclass.indexOf(d.subclass)<0)
                subclass.push(d.subclass);
              if(mainClass.indexOf(d.class)<0)
                mainClass.push(d.class);
            });
            $('#classFilter').find('.menu')
              .empty()
              .append(mainClass.map(function(e) {
                return '<div class="item" data-value="'+e+'">'+e+'</div>';
              }));
            $('#subclassFilter').find('.menu')
              .empty()
              .append(subclass.map(function(e) {
                return '<div class="item" data-value="'+e+'">'+e+'</div>';
              }));
            $('#pathway_modal .content').empty();
            $('#pathway_modal .header').html(pathwayMap[value]);
            if(value && value != 'missing') {
              pathwayModal = new Pathway({
                pathwayId: value,
                container: '#pathway_modal .content',
                tooltip: function(d) {
                  return d.name + '<br>' + d.CCS;
                },
                color: function(d) {
                  return 'red';
                },
                data: filteredData.reduce(function(a, d) {
                  if(!a.hasOwnProperty(d.kegg))
                    a[d.kegg] = d;
                  return a;
                }, {}),
              });
            } else {
              $('#pathway_modal .content').html('No Pathway Selected');
            }
          },
        });
      });
    });
    // apply max width and title to pathway filter dropdown
    $('#pathwayFilter').parent()
      .attr('title', 'Filter by Pathway')
      .css('max-width', '250px');
    // apply max width and title to class filter dropdown
    $('#classFilter').parent()
      .attr('title', 'Filter by Class')
      .css('max-width', '340px');
    // apply max width and title to subclass filter dropdown
    $('#subclassFilter').parent()
      .attr('title', 'Filter by Subclass')
      .css('max-width', '340px');
    // append dropdown information to class filter dropdown.
    $('#classFilter').append(
      '<input type="hidden" name="class">'
      +'<div class="default text">Class</div>'
      +'<i class="dropdown icon"></i>'
      +'<div class="menu">'
      + classes.map(function(e) {
        return '<div class="item" data-value="'+e+'">'+e+'</div>';
      }).join('')
      +'</div>'
    )
    .dropdown({
      onChange: function(value, text, $selectedItem) {
        table.column(0)
          .search(value.replace(/,/g, '|'), true, false)
          .draw();
        let filteredData = table.rows({filter: 'applied'}).data();
        let subclass = [];
        filteredData.each(function(d) {
          if(subclass.indexOf(d.subclass)<0)
            subclass.push(d.subclass);
        });
        if(pathwayModal) {
          pathwayModal.data(filteredData.reduce(function(a, d) {
            if(!a.hasOwnProperty(d.kegg))
              a[d.kegg] = d;
            return a;
          }, {}))
          .draw();
        }
        $('#subclassFilter').find('.menu')
          .empty()
          .append(subclass.map(function(e) {
            return '<div class="item" data-value="'+e+'">'+e+'</div>';
          }));
      },
    });
    // append dropdown information to class filter dropdown.
    $('#subclassFilter').append(
      '<input type="hidden" name="subclass">'
      +'<div class="default text">Subclass</div>'
      +'<i class="dropdown icon"></i>'
      +'<div class="menu">'
      + subclasses.map(function(e) {
        return '<div class="item" data-value="'+e+'">'+e+'</div>';
      }).join('')
      +'</div>'
    ).dropdown({
      onChange: function(value, text, $selectedItem) {
        table.column(1)
          .search(value.replace(/,/g, '|'), true, false)
          .draw();
        let filteredData = table.rows({filter: 'applied'}).data();
        if(pathwayModal) {
          pathwayModal.data(filteredData.reduce(function(a, d) {
            if(!a.hasOwnProperty(d.kegg))
              a[d.kegg] = d;
            return a;
          }, {}))
          .draw();
        }
      },
    });
  });
  // load about modal when about button clicked
  $('#about_btn').on('click', function(evt) {
    $('#about_modal').modal('show');
  });
  // load download dropdown
  $('#downloadDropdown').dropdown();
  // load help modal when help button clicked
  $('#helpBtn').on('click', function(evt) {
    $('#help_modal').modal('show');
  });
});
