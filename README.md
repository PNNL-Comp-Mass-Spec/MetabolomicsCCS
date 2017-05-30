# Metabolomics Collision Cross Section Database and Server
This repository hosts two things. First is the source code (js) for a website created to display collision cross section data for metabolites and other small molecules. The second is the underlying CCS dataset.

The growing interest in metabolomic and exposomic studies is also inciting a need for new techniques to analyze these diverse molecules. Mass spectrometry-based  studies are often preferred for the confident identification of small molecules. Ion mobility spectrometry (IMS) is capable of separating molecules that have the same m/z but different conformational arrangements, which is very useful in metabolomic and exposomic analyses. As the desire for IMS measurements of metabolites continues to grow, so does the need for high quality collision cross section (CCS) values.  

## Data Validity
We use the [Good Tables](http://goodtables.io) data framework for testing data compliance, according to the format and expected values (see [metabolitedata-schema.json](https://github.com/PNNL-Comp-Mass-Spec/urineMetabolite/blob/master/metabolitedata-schema.json) and [goodtables.yml](https://github.com/PNNL-Comp-Mass-Spec/urineMetabolite/blob/master/goodtables.yml). The badge below shows the current status of the data.

[![Goodtables](http://goodtables.io/badge/github/PNNL-Comp-Mass-Spec/MetabolomicsCCS.svg)](http://goodtables.io/github/PNNL-Comp-Mass-Spec/MetabolomicsCCS)



## Data usage
This data is publically available, created by [Dr. Erin S. Baker](https://omics.pnl.gov/staff-page/Baker/Erin) with funding from the [National Institutes of Health](http://www.nih.gov) grant R01-ES022190.

## Dev Environment

To setup the dev environment
* clone the repository
* download [Mongoose web server](https://www.cesanta.com/) or some other web server into the repository's directory
* run server

I use [Atom](https://atom.io/) as my text editor with [eslint](https://atom.io/packages/eslint) and [eslint-config-google](https://devhub.io/repos/google-eslint-config-google).
Please conform to the eslint style guide to keep code consistant and easy to read.

## Hosting your own webserver
After starting the [Mongoose web server](https://www.cesanta.com/) open a modern browser and go to localhost:8080
