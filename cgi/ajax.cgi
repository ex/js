#!/usr/bin/perl
use strict;
use warnings;

use CGI;

my $query = new CGI;

my $secretword = $query->param('w');
my $remotehost = $query->remote_host();

print $query->header;
print "<p>The secret word is <b>$secretword</b> and your IP is <b>$remotehost</b>";
