#!/usr/bin/perl
use strict;
use warnings;

print "Content-type: text/html\n\n";
print <<"EOF";
<html>
<head>
    <title>Fizzbuzz CGI</title>
</head>
<body>
    <hi>Fizzbuzz</h1>
    <table>
EOF
for ( my $k = 1; $k <= 100; $k++ )
{
    print( "\t\t<tr>\n\t\t\t<td>$k</td><td>&nbsp;</td><td>" );
    if ( $k % 3 == 0 )
    {
        print( ( $k % 5 != 0 )? "Fizz" : "FizzBuzz" );
    }
    else
    {
        print( ( $k % 5 != 0 )? "$k" : "Buzz" );
    }
    print( "</td>\n\t\t</tr>\n" );
}
print <<"EOF";
    </table>
</body>
</html>
EOF
