# Metabolomics Collision Cross Section Database and Server
This repository hosts two things. First is the source code (js) for a website created to display collision cross section data for metabolites and other small molecules. The second is the underlying CCS dataset.


The growing interest in metabolomic and exposomic studies is also inciting a need for new techniques to analyze these diverse molecules. Mass spectrometry-based  studies are often preferred for the confident identification of small molecules. Ion mobility spectrometry (IMS) is capable of separating molecules that have the same m/z but different conformational arrangements, which is very useful in metabolomic and exposomic analyses. As the desire for IMS measurements of metabolites continues to grow, so does the need for high quality collision cross section (CCS) values.  

<!-- Good Tables has a bug with their website not checking missing value field in the schema, the data has been manually checked and determined to be valid. This will be added back to the readme when good tables corrects the problem with their website. -->
## Data Validity
<!--We use the [Good Tables](http://goodtables.io) data framework for testing data compliance, according to the format and expected values (see [metabolitedata-schema.json](https://github.com/PNNL-Comp-Mass-Spec/urineMetabolite/blob/master/metabolitedata-schema.json) and [goodtables.yml](https://github.com/PNNL-Comp-Mass-Spec/urineMetabolite/blob/master/goodtables.yml). The badge below shows the current status of the data.-->
This data has been manually checked for validity.

<!--[![Goodtables](http://goodtables.io/badge/github/PNNL-Comp-Mass-Spec/MetabolomicsCCS.svg)](http://goodtables.io/github/PNNL-Comp-Mass-Spec/MetabolomicsCCS)-->

## Data usage
This data is publicly available, created by Dr. Erin S. Baker with funding from the [National Institutes of Health](http://www.nih.gov) grant R01-ES022190.

Within the dataset, we are using CAS numbers as a primary identifier. If you download the .tsv version of this dataset and try to view within Microsoft Excel there can be some problems, as Excel sometimes mistakes the CAS number as dates if imported as general data. If you want to use Excel to view the data, please follow these instructions.
- start excel 
- go to data tab, select get external data from text. 
- Follow the importing process using delimited with tabs, and set the data format for all columns as text, not general.

This should allow you to see the CAS numbers as "12-23-543" instead of "December 23rd, 543 AD"

## Dev Environment

To setup the dev environment
* clone the repository
* download [Mongoose web server](https://www.cesanta.com/products/binary) or some other web server into the repository's directory
* run server

I use [Atom](https://atom.io/) as my text editor with [eslint](https://atom.io/packages/eslint) and [eslint-config-google](https://devhub.io/repos/google-eslint-config-google).
Please conform to the eslint style guide to keep code consistent and easy to read.

Check [DevReadme](DevReadme.md) for nuances about the code that might not be evident from the comments.

## Hosting your own web server
After starting the [Mongoose web server](https://www.cesanta.com/) open a modern browser and go to localhost:8080
