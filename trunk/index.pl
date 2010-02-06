#!/usr/bin/perl -w
print "content-type: text/html\n\n";
#xenstates: r(unning),b(locked),p(aused),c(rashed),d(ying),s(hutdown)
sub sysCall{
	my ($cmd,@arguments)=@_;
	open(COMMAND, "|".$cmd." ".join(' ',@arguments));
	$output=<COMMAND>;
	close(COMMAND);
	return $output;
}
$/=undef;
my $xencmd=`which xm`;
chomp($xencmd);
print "using ".$xencmd;

my $xmlist=sysCall($xencmd,("list"));
my $tplContent;
open(TPLFILE,"<index.tpl"); 
$tplContent = <TPLFILE>;
close(TPLFILE	);
print "swea".join('',$tplContent);
print "\n";
#print $output;

#foreach $line (split(/\n/,$output)){
#  print $line."..";
#}