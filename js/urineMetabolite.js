$(document).ready(function() {
  // map column headers to display format
  let columns = {
    'class': 'class',
    'name': 'Name',
    'cas': 'CAS Number',
    'formula': 'Formula',
    'mass': 'Exact Mass',
    'mPlusH': '[M+H]<sup>+</sup>',
    'mPlusHCCS': 'Average_[M+H]<sup>+</sup>',
    'mPlusHRsd': 'RSD_[M+H]<sup>+</sup>',
    'mPlusNa': '[M+Na]<sup>+</sup>',
    'mPlusNaCCS': 'Average_[M+Na]<sup>+</sup>',
    'mPlusNaRsd': 'RSD_[M+Na]<sup>+</sup>',
    'mMinusH': '[M-H]<sup>-</sup>',
    'mMinusHCCS': 'Average_[M-H]<sup>-</sup>',
    'mMinusHRsd': 'RSD_[M-H]<sup>-</sup>',
    'mPlusDot': '[M<sup>+&#x2022;</sup>]',
    'mPlusDotCCS': 'Average_[M+&#x2022;]',
    'mPlusDotRsd': 'RSD_[M<sup>+&#x2022;</sup>]',
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
  * Formats collision cross section for display in table cell.
  * @param {object} d Data object from table.
  * @return {string} the collision cross section formated for display
  */
  function getCCS(d) {
    return columns.mPlusH + ': ' + parseNumber(d.mPlusHCCS) + '<br>'
      + columns.mPlusNa + ': ' + parseNumber(d.mPlusNaCCS) + '<br>'
      + columns.mMinusH + ': ' + parseNumber(d.mMinusHCCS) + '<br>'
      + columns.mPlusDot + ': ' + parseNumber(d.mPlusDotCCS);
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
  * Used with map function to create an array of strings from kegg property in
  * all object.
  * @param {object} d Data object from table.
  * @return {string} string from kegg property in object.
  */
  function mapCompounds(d) {
    return d.kegg;
  }
  // include moleWeightCalc.js in script to calculate the mass from formula
  let MWC = new MolecularWeightCalculator();
  // parses the tsv data file
  let massOffset = [];
  d3.tsv('/data/metaboliteTestdata.txt', function(d) {
    // determins the object returned from processing the tsv data file
    let structureImage = '<img class="ui small image"'
      +'src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/'
      + (d.cid && d.cid.length > 0
        ? 'cid/' + d.cid : 'name/' + encodeURIComponent(d.name)) + '/PNG"'
      +' alt="image not found" onerror="this.onerror=null;'
      +'this.src=\'/metaboliteResources/images/default.jpg\';"/>';
    let calculatedMass = MWC.weight(d.formula);
    if(Math.abs(calculatedMass-parseFloat(d.mass))>1.5) {
      d['formulaMass']=calculatedMass;
      massOffset.push(d);
    }
    return {
      class: d.Main_Class,
      subclass: d.Sub_Class,
      kegg: d.kegg,
      name: d.name,
      cas: d.cas,
      formula: d.formula,
      structure: structureImage,
      mass: d.mass,
      CCS: getCCS(d),
      ccsFound: isCcsAvailable(d),
    };
  }, function(err, d) {
    // console.log(JSON.stringify(massOffset));
    // console.log(massOffset.length);
    if (err) {
      console.log(err);
      return;
    }
    d = d.filter(hasCCS);
    let classes = d.map(mapClasses)
      .filter(removeDups);
    classes.sort(sortStringArrayAsc);
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
    /* eslint new-cap:0*/
    // creates a datatable with tsv data file
    let table = $('#tablecontainer').DataTable({
      columns: columnIds,
      fixedHeader: true,
      dom: '<"ui borderless menu"<"item"l><"right menu"<"item"'
        +'<"#pathwayFilter.ui search selection dropdown">><"item"'
        +'<"#classFilter.ui multiple search selection dropdown">>'
        +'<"item"f>>><t>ip',
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
      ],
      drawCallback: function(settings) {
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
              '<tr class="group"><td colspan="6">' + group + '</td></tr>'
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
              '<tr class="sub_group"><td colspan="6">'
              + group + '</td></tr>'
            );
            last = group;
          }
        });
      },
    });
    // Order by the grouping when clicked
    $('#tablecontainer tbody').on('click', 'tr.group', function() {
      let currentOrder = table.order()[0];
      if (currentOrder[0] === 0 && currentOrder[1] === 'asc') {
        table.order([0, 'desc'])
          .draw();
      } else {
        table.order([0, 'asc'])
          .draw();
      }
    });
    $('#tablecontainer tbody').on('click', 'tr.sub_group', function() {
      let currentOrder = table.order()[0];
      if (currentOrder[0] === 1 && currentOrder[1] === 'asc') {
        table.order([1, 'desc'])
          .draw();
      } else {
        table.order([1, 'asc'])
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
      url: '/metaboliteResources/compoundList.json',
    }).done(function(d) {
      compoundList = d;
      // read pathway list file
      $.ajax({
        url: '/metaboliteResources/pathwayList.txt',
      }).done(function(data) {
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
        data = [{path: '', name: 'No Pathway Filter'}].concat(data);
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
            table.column(1)
              .search(compoundList[value].join('|'), true, false)
              .draw();
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
    ).dropdown({
      onChange: function(value, text, $selectedItem) {
        table.column(0)
          .search(value.replace(/,/g, '|'), true, false)
          .draw();
      },
    });
  });
  // load about modal when about button clicked
  $('#about_btn').on('click', function(evt) {
    $('#about_modal').modal('show');
  });
  $('#downloadDropdown').dropdown();
});
