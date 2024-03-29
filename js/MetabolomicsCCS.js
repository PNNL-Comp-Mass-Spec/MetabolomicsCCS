const githubRepositoryBase = '';
// const githubRepositoryBase = 'https://raw.githubusercontent.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS/master/';
/**
* Event handler for when an error occurs when loading a strcuture image from
* PubChem. If error occurs during downloading image it will wait .5 seconds then
* try again. If another error occurs it will load a default "not found" image.
* @param {object} img The image element.
*/
function imageError(img) { // eslint-disable-line no-unused-vars
  if (img.imgError) {
    clearTimeout(img.imgError);
    img.onerror=null;
    img.src= githubRepositoryBase + 'metaboliteResources/images/default.jpg';
  } else {
    img.imgError = setTimeout(function() {
      // added date to the end will force image to load from source, not cache
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
    'mPlusTwoH': '[M+2H]<sup>2+</sup>',
    'mPlusTwoHCCS': 'Average_[M+2H]<sup>2+</sup>',
    'mPlusTwoHRsd': 'RSD_[M+2H]<sup>2+</sup>',
    'mPlusC2H3O2': '[M+C2H3O2]<sup>-</sup>',
    'mPlusC2H3O2CCS': 'Average_[M+C2H3O2]<sup>-</sup>',
    'mPlusC2H3O2Rsd': 'RSD_[M+C2H3O2]<sup>-</sup>',
    'mPlusCHO2': '[M+CHO2]<sup>-</sup>',
    'mPlusCHO2CCS': 'Average_[M+CHO2]<sup>-</sup>',
    'mPlusCHO2Rsd': 'RSD_[M+CHO2]<sup>-</sup>',
    'mMinusClO': '[M-Cl+O]<sup>-</sup>',
    'mMinusClOCCS': 'Average_[M-Cl+O]<sup>-</sup>',
    'mMinusClORsd': 'RSD_[M-Cl+O]<sup>-</sup>',
    'mMinusBrO': '[M-Br+O]<sup>-</sup>',
    'mMinusBrOCCS': 'Average_[M-Br+O]<sup>-</sup>',
    'mMinusBrORsd': 'RSD_[M-Br+O]<sup>-</sup>',
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
    if (isNaN(result)) {
      result = 'N/A';
    }
    return result;
  }
  /**
  * Checks if at least one collision cross section of the object is available.
  * @param {object} d Data object from table.
  * @return {boolean} True if at least one valid number is available in object.
  */
  function isCcsAvailable(d) {
    if (isNaN(parseFloat(d.mPlusHCCS))
       && isNaN(parseFloat(d.mPlusNaCCS))
       && isNaN(parseFloat(d.mMinusHCCS))
       && isNaN(parseFloat(d.mPlusKCCS))
       && isNaN(parseFloat(d.mPlusCCS))
       && isNaN(parseFloat(d.mPlusDotCCS))
       && isNaN(parseFloat(d.mPlusTwoHCCS))
       && isNaN(parseFloat(d.mPlusC2H3O2CCS))
       && isNaN(parseFloat(d.mPlusCHO2CCS))
       && isNaN(parseFloat(d.mMinusClOCCS))
       && isNaN(parseFloat(d.mMinusBrOCCS))
       ) {
        return false;
      }
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
  * @param {string} display The adduct as a string, i.e. (M+H)+
  * @param {float} value The value of the ccs
  * @return {string} the proper display or an empty string
  */
  function ccsString(display, value) {
    if (value) {
      let parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        return display + ': ' + parseNumber(value) + '<br>';
      }
    }
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
         + ccsString(columns.mPlus, d.mPlusCCS)
         + ccsString(columns.mPlusTwoH, d.mPlusTwoHCCS)
         + ccsString(columns.mPlusDot, d.mPlusDotCCS)
         + ccsString(columns.mPlusC2H3O2, d.mPlusC2H3O2CCS)
         + ccsString(columns.mPlusCHO2, d.mPlusCHO2CCS)
         + ccsString(columns.mMinusClO, d.mMinusClOCCS)
         + ccsString(columns.mMinusBrO, d.mMinusBrOCCS);
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
     let pubChemId = d.cid || d['PubChem CID'];
    // determins the object returned from processing the tsv data file
    let structureImage = '<img class="ui small image structureImage"'
      +'src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/'
      + (pubChemId && pubChemId.length > 0
        ? 'cid/' + pubChemId : 'name/' + encodeURIComponent(d['Neutral Name']))
        + '/PNG" alt="image not found" onerror="imageError(this)"/>';
    return {
      class: d.main_class,
      subclass: d.subclass || 'Others',
      kegg: d.kegg || d.KEGG,
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
  d3.tsv(githubRepositoryBase + 'data/metabolitedata.tsv',
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
      if (ordering.length > 1) {
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
        table.order([0, 'asc'], [1, 'asc'])
          .draw();
      }
    });
    // Order by the subclass when clicked
    $('#tablecontainer tbody').on('click', 'tr.sub_group', function() {
      let ordering = table.order();
      let currentOrderClass;
      let currentOrderSubclass;
      if (ordering.length > 1) {
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
    if (window.location.href.indexOf('localhost')>=0) {
      table.$('tr').on('mouseover', function() {
        $(this).popup('show');
      }).on('mouseout', function() {
        $(this).popup('hide');
      });
    }

    /* eslint no-extend-native:0*/
    /**
    * Used to check if an element from arr is in this array.
    * @param {array} arr array passed in to compare with.
    * @return {boolean} true if element in arr found in this array, false
    * otherwise.
    */
    Array.prototype.in = function(arr) {
      for (let a in arr) {
        if (this.indexOf(arr[a])>=0) {
          return true;
        }
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
          if (!a.hasOwnProperty(d.path)) {
            a[d.path] = d.name;
          }
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
            if (value == 'missing') {
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
              if (subclass.indexOf(d.subclass)<0) {
                subclass.push(d.subclass);
              }
              if (mainClass.indexOf(d.class)<0) {
                mainClass.push(d.class);
              }
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
            if (value && value != 'missing') {
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
                  if (!a.hasOwnProperty(d.kegg)) {
                    a[d.kegg] = d;
                  }
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
          if (subclass.indexOf(d.subclass)<0) {
            subclass.push(d.subclass);
          }
        });
        if (pathwayModal) {
          pathwayModal.data(filteredData.reduce(function(a, d) {
            if (!a.hasOwnProperty(d.kegg)) {
              a[d.kegg] = d;
            }
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
        if (pathwayModal) {
          pathwayModal.data(filteredData.reduce(function(a, d) {
            if (!a.hasOwnProperty(d.kegg)) {
              a[d.kegg] = d;
            }
            return a;
          }, {}))
          .draw();
        }
      },
    });
    /**
    * this function creates a anchor element and applies the text to it
    * creating a file.
    * @param {string} filename the name for the file.
    * @param {string} text the string contents of the file
    *
    */
    function download(filename, text) {
      let element = document.createElement('a');
      element.setAttribute('href',
       'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
    /**
     * This function creates a opens the metabolitedata file and finds the
     * selected IDs using the CAS number
     * @param {array} ids An array of CAS IDs.
     * @param {string} fileName The name for the file
     * @param {string} dataFile the relative path to the datafile to load from
     * @param {string} delimiter The column delimiter; should be either a tab or a comma
     *
     */
    function createDownload(ids, fileName, dataFile, delimiter) {
      let keepFirstRow = true;
      let filterFunction = function(e) {
      	 // The CAS ID column is Uppercase in .csv files
         return ids.indexOf(e.CAS) >= 0;
      };
      if (dataFile.endsWith('.tsv')) {
         keepFirstRow = false;
         filterFunction = function(e) {
         	// The CAS ID column is lowercase in .tsv files
            return ids.indexOf(e.cas) >= 0;
         };
      }
      let complete = function(d) {
         let row;
         let headers = d.columns;
         if (keepFirstRow) {
            row = d[0];
         }
         // create tsv or csv from data
         d = d.filter(filterFunction);
         let dataStr = headers.join(delimiter) + '\n';
         if (row) {
            dataStr += headers.map(function(f) {
               return row[f];
            }).join(delimiter) + '\n';
         }
         dataStr += d.map(function(e) {
            return headers.map(function(f) {
               return e[f];
            }).join(delimiter);
         }).join('\n');
         download(fileName, dataStr);
      };
      d3.tsv(githubRepositoryBase + dataFile,
         function(d) {
            return d;
         }, complete);
   }
   $('#currentPageDownloadAgilent').on('click', function(evt) {
     let visibleRows = $('#tablecontainer tbody tr').filter(function(i, d) {
        return !$(d).hasClass('group') && !$(d).hasClass('sub_group');
     });
     let visibleDataIds = visibleRows.map(function(i, d) {
        return table.row(d).data().cas;
     }).toArray();
     createDownload(visibleDataIds,
        'page_'+(table.page.info().page + 1)
        +'_of_'+table.page.info().pages+'_metabolitedataAgilent.csv',
        'data/metabolitedataAgilent.csv',
        ',');
   });
   $('#currentSearchDownloadAgilent').on('click', function(evt) {
      let filteredData = table.rows({filter: 'applied'})
        .data().map(function(d) {
           return d.cas;
        });
      // create tsv from data
      createDownload(filteredData,
         $('#pathwayFilter').dropdown('get text')
         .replace(/ /g, '_') + '_' + table.search()
         + '_metabolitedataAgilent.csv',
         'data/metabolitedataAgilent.csv',
         ',');
   });
    $('#currentPageDownload').on('click', function(evt) {
      let visibleRows = $('#tablecontainer tbody tr').filter(function(i, d) {
         return !$(d).hasClass('group') && !$(d).hasClass('sub_group');
      });
      let visibleDataIds = visibleRows.map(function(i, d) {
         return table.row(d).data().cas;
      }).toArray();
      createDownload(visibleDataIds,
         'page_'+(table.page.info().page + 1)
         +'_of_'+table.page.info().pages+'_metabolitedata.tsv',
         'data/metabolitedata.tsv',
         '\t');
    });
    $('#currentSearchDownload').on('click', function(evt) {
       let filteredData = table.rows({filter: 'applied'})
         .data().map(function(d) {
            return d.cas;
         });
       // create tsv from data
       createDownload(filteredData,
          $('#pathwayFilter').dropdown('get text')
          .replace(/ /g, '_') + '_' + table.search() + '_metabolitedata.tsv',
          'data/metabolitedata.tsv',
          '\t');
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
    $('.enlarge-hover').each(function(d) {
      $(this).popup( {
         html: '<img width:"600" height="auto" src="'
            + $(this).attr('src') + '"></img>',
      });
   });
  });
});
