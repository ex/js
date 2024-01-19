##==============================================================================
## Traverse file paths
## Author: Laurens Rodriguez.
##------------------------------------------------------------------------------
use strict;
use warnings;
use diagnostics;

my $outputFile;
my $workingPath = 'npm';

print( " Recurse: $workingPath\n" );
open( $outputFile, '>', "pixi.d.ts" ) or dieError( "Can't create output: $!" );

    print $outputFile "/**\n";
    print $outputFile "* \@namespace PIXI\n";
    print $outputFile "*/\n";
    print $outputFile "declare namespace PIXI {\n";

    recurse( $workingPath, \&printFile, );

    print $outputFile "}\n\n";
    print $outputFile "declare module \"pixi.js\" {\n";
    print $outputFile "    export = PIXI;\n";
    print $outputFile "}\n";

close( $outputFile );

##------------------------------------------------------------------------------
sub printFile
{
    my $file = shift;
    if ( $file =~ /.+\.d\.ts$/  && $file !~ /.+global\.d\.ts$/ )
    {
        print "\t$file\n";

        my $in = $file;
        my $count = 0;
        print $outputFile "//////////////////////////////// $file\n";
        open(FHI, '<', $in) or die("File $in not found\n");

        while (my $str = <FHI>)
        {
            $count++;
            next if ( $str =~ /^\s*import\s+/);
            print $outputFile "    $str";
        }
        print $outputFile "////[$count]\n";
        close(FHI);
    }
}

##------------------------------------------------------------------------------
sub recurse
{
    my $path = shift;
    my $onFileCallback = shift;
    ## This can return 1 to cancel recursive scan or be undefined to process all files
    my $onFolderCallback = shift;
    my $scaped = $path =~ /".+"/;

    if ( ( -e $path ) && ( ! -d $path ) )
    {
        $onFileCallback->( $path ) if ( defined $onFileCallback );
        return;
    }

    ## Append a trailing / if it's not there.
    $path .= '/' if ( $path !~ /\/$/ );

    ## Loop through the files contained in the directory.
    for my $eachFile ( glob( $path . '*' ) )
    {
        if ( -d $eachFile )
        {
            $eachFile = "\"$eachFile\"" if ( $scaped );
            if ( defined $onFolderCallback )
            {
                if ( !$onFolderCallback->( $eachFile ) )
                {
                    ## If is a directory and can continue recursive scan.
                    recurse( $eachFile, $onFileCallback, $onFolderCallback );
                }
            }
            else
            {
                recurse( $eachFile, $onFileCallback, $onFolderCallback );
            }
        }
        elsif ( defined $onFileCallback )
        {
            $onFileCallback->( $eachFile );
        }
    }
}
