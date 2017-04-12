$(document).ready(function() {
  //map column headers to display format
  var columns = {
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
    'structure': 'Structure'
  };

  //parses a string to a 2 decimal precision float or string "N/A"
  function parseNumber(num) {
    var result = parseFloat(num).toFixed(2);
    if (isNaN(result))
      result = 'N/A';
    return result;
  }
  function isCcsAvailable(d){
    if(isNaN(parseFloat(d.mPlusHCCS)) &&
      isNaN(parseFloat(d.mPlusNaCCS)) &&
      isNaN(parseFloat(d.mMinusHCCS)) &&
      isNaN(parseFloat(d.mPlusDotCCS)))
        return false;
    return true;
  }

//returns the collision cross section formated for display
  function getCCS(d) {
    return columns.mPlusH + ': ' + parseNumber(d.mPlusHCCS) + '<br>' + columns.mPlusNa + ': ' +
      parseNumber(d.mPlusNaCCS) + '<br>' + columns.mMinusH + ': ' + parseNumber(d.mMinusHCCS) + '<br>' + columns.mPlusDot + ': ' + parseNumber(d.mPlusDotCCS);
  }
  // include moleWeightCalc.js in script and PeriodicTaleJSON.json in folder to calculate the mass from formula
  // var MWC = new MolecularWeightCalculator();
//parses the tsv data file
  d3.tsv('/data/metaboliteTestdata.txt', function(d) {
    //determins the object returned from processing the tsv data file

    return {
      class: d.class,
      kegg:d.kegg,
      name: d.name,
      cas: d.cas,
      formula: d.formula,
      structure: '<img class="ui small image" src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/' + (d.cid && d.cid.length > 0 ? 'cid/' + d.cid : 'name/' + encodeURIComponent(d.name)) + '/PNG">',
      mass: d.mass,
      CCS: getCCS(d),
      ccsFound:isCcsAvailable(d)
    };
  }, function(err, d) {
    if (err) {
      console.log(err);
      return;
    }
    d = d.filter(function(e){return e.ccsFound;});
    var classes =  d.map(function(e){return e.class;});
    classes=classes.filter(function(item, pos) {
        return classes.indexOf(item) == pos;
    });
    classes.sort(function(a,b){return a==b?0:a>b?1:-1;})
    var compounds =  d.map(function(e){return e.kegg;});
    compounds=compounds.filter(function(item, pos) {
        return compounds.indexOf(item) == pos;
    });
    var columnIds = d.columns;
    delete d.columns;
    //map array of headers into format for datatables
    columnIds = ['class','kegg', 'name', 'cas', 'formula', 'structure', 'mass', 'CCS'].map(function(e) {
      return {
        title: columns[e],
        data: e
      };
    });
    // creates a datatable with tsv data file
    var table = $('#tablecontainer').DataTable({
      columns: columnIds,
      fixedHeader: true,
      dom: '<"ui borderless menu"<"item"l><"right menu"<"item"<"#pathwayFilter.ui search selection dropdown">><"item"<"#classFilter.ui multiple search selection dropdown">><"item"f>>><t>ip',
      data: d,
      columnDefs: [{
          visible: false,
          targets: [0,1]
        },
        {
          width: 150,
          targets: 7
        },
        {
          orderable: false,
          targets: 5
        }
      ],
      order: [
        [0, 'asc']
      ],
      drawCallback: function(settings) {
        var api = this.api();
        var rows = api.rows({
          page: 'current'
        }).nodes();
        var last = null;
        api.column(0, {
          page: 'current'
        }).data().each(function(group, i) {
          if (last !== group) {
            $(rows).eq(i).before(
              '<tr class="group"><td colspan="6">' + group + '</td></tr>'
            );
            last = group;
          }
        });
      }
    });
    // Order by the grouping
    $('#tablecontainer tbody').on('click', 'tr.group', function() {
      var currentOrder = table.order()[0];
      if (currentOrder[0] === 0 && currentOrder[1] === 'asc') {
        table.order([0, 'desc']).draw();
      } else {
        table.order([0, 'asc']).draw();
      }
    });
    Array.prototype.in = function(arr){
      for(var a in arr){
        if(this.indexOf(arr[a])>=0)
          return true;
      }
      return false;
    }

    var compoundList;
    $.ajax({
      url:'/metaboliteResources/compoundList.json'
    }).done(function(d){
      compoundList = d;
      $.ajax({
        url:'/metaboliteResources/pathwayList.txt'
      }).done(function(data){
        data = data.split('\n').filter(function(line){return line.length>0;}).map(function(line){var elements = line.split('\t'); return {path:elements[0].split(':')[1],name:elements[1]};});
        data.sort(function(a,b){return a.name==b.name?0:a.name>b.name?1:-1;})
        data = data.filter(function(d){
          return compoundList[d.path].length>0&&compoundList[d.path].in(compounds);
        })
        data = [{path:'',name:'No Pathway Filter'}].concat(data);
        $('#pathwayFilter').append(
          '<input type="hidden" name="class">'
          +'<div class="default text">Pathway</div>'
          +'<i class="dropdown icon"></i>'
          +'<div class="menu">'
          + data.map(function(e){return '<div class="item" data-value="'+e.path+'">'+e.name+'</div>';}).join('')
          +'</div>'
        ).dropdown({onChange: function(value, text, $selectedItem) {
          table.column(1).search(compoundList[value].join('|'), true, false).draw();
        }});
      });
    })
    $('#pathwayFilter').parent().attr('title','Filter by Pathway').css('max-width','250px');

    $('#classFilter').parent().attr('title','Filter by Class').css('max-width','340px');
    $('#classFilter').append(
      '<input type="hidden" name="class">'
      +'<div class="default text">Class</div>'
      +'<i class="dropdown icon"></i>'
      +'<div class="menu">'
      + classes.map(function(e){return '<div class="item" data-value="'+e+'">'+e+'</div>';}).join('')
      +'</div>'
    ).dropdown({onChange: function(value, text, $selectedItem) {
      table.column(0).search(value.replace(/,/g,'|'), true, false).draw();
    }});
  });
});
