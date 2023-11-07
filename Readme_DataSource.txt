The master repository for the metabolites browser files is at 
https://github.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS

File /js/MetabolomicsCCS.js defines the paths to the data:

https://raw.githubusercontent.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS/master/data/metabolitedata.tsv
https://raw.githubusercontent.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS/master/metaboliteResources/compoundList.json
https://raw.githubusercontent.com/PNNL-Comp-Mass-Spec/MetabolomicsCCS/master/metaboliteResources/pathwayList.txt


Use the https://github.com/PNNL-Comp-Mass-Spec/MetaboliteValidation tool to add new data.  

That tool reads a .tsv file with new compounds, then merges that information 
with the information in the metabolitedata.tsv file mentioned above.  It then updates files:
* metabolitedata.tsv
* metabolitedataAgilent.tsv
