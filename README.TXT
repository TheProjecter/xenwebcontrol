This program is a small admin console for your Xen Vitualisation System. 

You need no additional libraries - except those that are installed on a Xen-installation.

If you build new extensions, I would appreciate an exchange of code.

If you use this programm - feel free to inform me!

Stefan Hortschitz
stefan@mogi.at

WARNING: 
This system runs under !root! - you have to secure it for yourself!

REQUIREMENTS:
This software is written for Debian Lenny - check, if the binaries on your system have the same position
e.g. /usr/sbin/xm

Config files searched under /etc/xen/*.cfg


INSTALLTION:
 copy all files to some place on your system
 open a shell and go to the new directory
 start the server with 
 nohup python server.pl &
 
After this steps you could access the admin-page via http.

TODO:
 - http authentication
 - print logfile