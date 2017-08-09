##################################################################
#
# This Powershell script converts data in metabolitedata.tsv
# into a format compatible with the Agilent software suite 
# for metabolite identification.
#
# Although this script is valid, the primary tool for creating
# the .tsv files is a C# application tracked at
# https://github.com/PNNL-Comp-Mass-Spec/metaboliteValidation
#
# Written by Matthew Monroe for PNNL in 2017
#
##################################################################

$inputFilePath  = "metabolitedata.tsv";
$outputFilePath = "metabolitedataAgilent.tsv";

try
{
    # Create the output file
    $outFile = [System.IO.StreamWriter]::new( $outputFilePath );

    # Add the headers
    $headers = ("#Formula", "Mass", "Cpd", "KEGG", "CAS", "Polarity", "Ion Species", "CCS", "Z", "Gas", "CCS Standard", "Notes");
    $outFile.WriteLine($headers -join "`t");

    if ( !(Test-Path $inputFilePath) ) {
        Write-output "File not found: $inputFilePath"
        exit
    }

    Write-output "Opening $inputFilePath";    

    # Parse the file line-by-line
    Import-Csv $inputFilePath -Delimiter "`t" | ForEach-Object {

        $outLineBase = ($_.formula, $_.mass, $_."Neutral Name", $_.kegg, $_.cas);

        $added = $false

        if (Is-Numeric $_.mPlusHCCS)
        {
            Append-Compound $outFile $outLineBase "positive" "(M+H)+" $_.mPlusHCCS
            $added = $true
        }

        if (Is-Numeric $_.mPlusNaCCS)
        {
            Append-Compound $outFile $outLineBase "positive" "(M+Na)+" $_.mPlusNaCCS;
            $added = $true
        }

        if (Is-Numeric $_.mMinusHCCS)
        {
            Append-Compound $outFile $outLineBase "negative" "(M-H)-" $_.mMinusHCCS;
            $added = $true
        }

        if (!$added -and !(Is-Numeric $_.mPlusDotCCS)) {
            Write-output "compound has no known CCS values and should be removed from the input file: $($_."Neutral Name")"
        }
    }

}
finally
{
    $outFile.close()

    Write-output "Results written to $outputFilePath";
}

exit $LASTEXITCODE

function Append-Compound ($outFile, $outLineBase, $polarity, $ionSpecies, $ccs) {
 
    [System.Collections.ArrayList]$outLine = $outLineBase;

    $outLine.Add($polarity) > $null
    $outLine.Add($ionSpecies) > $null
    $outLine.Add($ccs) > $null
            
    # Add charge (always an empty string), gas, and two more empty columns
    $outLine.Add("") > $null
    $outLine.Add("N2") > $null
    $outLine.Add("") > $null
    $outLine.Add("") > $null

    $outFile.WriteLine($outLine -join "`t");
}

# Check if the number is an integer or floating point value
# Recognizes scientific notation of the form 1.34E+43
function Is-Numeric ($Value) {
    return $Value -match "^-?[\d\.]+(E[+-]?\d+)?$"
}
