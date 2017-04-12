function MolecularWeightCalculator(){
  this.periodicTable;
  this.init();
  return this;
}

MolecularWeightCalculator.prototype = {
    init:function(){
      var _this = this;
      $.ajax({
        url:'PeriodicTableJSON.json',
        async:false
      }).done(function(data){
        _this.periodicTable = data;
      });
    },
    weight:function(formula){
      if(!formula || formula.length <=0||formula == 'N/A') return;
      var _this = this;
      return _this.helpers.parseFormula(formula)
        .map(function(d){
          var symbolAmountPair = _this.helpers.matchSymbol(d),
            elementMass = parseFloat(_this.helpers.getElementBySymbol(_this.periodicTable.elements,symbolAmountPair.symbol).atomic_mass);
          return elementMass*symbolAmountPair.amount;}).reduce(function(a,e){return a+e;},0);
    },
    helpers:{
      getElementBySymbol:function(table,symbol){
        var result = table.filter(
          function(f){
            return f.symbol == symbol;
          })[0];
        if(!result){
          console.log(symbol);
          return;
        }
        return result;
      },
      matchSymbol:function(symbolAmountPair){
        return {
          symbol:symbolAmountPair.match(/[A-Z][a-z]?/)[0],
          amount:parseInt(symbolAmountPair.match(/[0-9]{1,2}/)?symbolAmountPair.match(/[0-9]{1,2}/)[0]:1)
        };
      },
      parseFormula:function(formula){
        return formula.match(/[A-Z][a-z]?(?:[0-9]{1,2}|)/g);
      }

    }
}
