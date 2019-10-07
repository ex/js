use strict;
use warnings;

my $INPUT_FILE = 'data.txt';
my $OUTPUT_FILE = 'data.js';

open( my $file, "<", $INPUT_FILE ) or die( "Can't open $INPUT_FILE: $!" );
open( my $js, ">", $OUTPUT_FILE ) or die( "Can't create $OUTPUT_FILE: $!" );

my @counter = ( 0 ) x 45;
my $dataNumber = 0;

print( $js "var g_lottoData = [\n" );
while ( my $line = <$file> )
{
    ## 29/09/2019	0640	26 14 13 02 43 32 	10
    if ( $line =~ /(\d{2})\/(\d{2})\/(\d{4})\t(\d{4})\s+(\d{2})\s(\d{2})\s(\d{2})\s(\d{2})\s(\d{2})\s(\d{2})\s*/ )
    {
        my $dd = $1;
        my $mm = $2;
        my $yyyy = $3;
        my $c = $5;
        my $d = $6;
        my $e = $7;
        my $f = $8;
        my $g = $9;
        my $h = $10;
        my @m = ( trim( $c ), trim( $d ), trim( $e ), trim( $f ), trim( $g ), trim( $h ) );
        ## sort array
        @m = sort { $a <=> $b } @m;
        ## count elements
        foreach my $k ( @m )
        {
            ++$counter[$k - 1];
        }
        print( $js "\t[[${\trim($dd)}, ${\trim($mm)}, ${\trim($yyyy)}], [$m[0], $m[1], $m[2], $m[3], $m[4], $m[5]]],\n" );
        $dataNumber++;
        next;
    }
    print( $line );
}
print( $js "];\n" );

print( $js "var g_lottoDataCounter = $dataNumber;\n" );

my $factor = 6 * $dataNumber / ( 45 * 25 );

print( $js "var g_lottoDraft = [\n" );
for ( my $k = 0; $k < @counter; $k++ )
{
    my $r = int( 0.5 + $counter[$k] / $factor );
    my $s = ( $k < 9 ) ? ' ' . ( $k + 1 ) . ', ' : ( $k + 1 ) . ', ';
    $r = $s x $r;
    print( $js "\t$r\n" );
}
print( $js "];\n" );
close( $file );
close( $js );

sub trim
{
    my $ret = shift;
    $ret =~ s/^0/ /;
    return $ret;
}
