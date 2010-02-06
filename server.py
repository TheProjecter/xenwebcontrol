#!/usr/bin/python
#
#Copyright (C) 2010 Stefan Hortschitz, MOGI business creation company GmbH, Austria
#
#This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
#as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
#
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
#without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
#See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program; if not, see <http://www.gnu.org/licenses/>.
 
import os,subprocess
import string,time,urllib
import glob
import ConfigParser
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from string import Template

def xmExec(machine,newStatus,configFile=""):
	if newStatus=="stop":
		prozess = subprocess.Popen("/usr/sbin/xm stop "+machine, shell=True,  stdout=subprocess.PIPE)
	elif newStatus=="shutdown":
		prozess = subprocess.Popen("/usr/sbin/xm shutdown "+machine, shell=True,  stdout=subprocess.PIPE)
		print "shutting down "+machine
	elif newStatus=="restart":
		prozess = subprocess.Popen("/usr/sbin/xm reboot "+machine, shell=True, stdout=subprocess.PIPE)
		print "restarting "+machine
	elif newStatus=="destroy":
		prozess = subprocess.Popen("/usr/sbin/xm destroy "+machine, shell=True, stdout=subprocess.PIPE)
		print "destroying "+machine
	elif newStatus=="start":
		print "starting "+machine+" with configfile "+configFile
		prozess = subprocess.Popen("/usr/sbin/xm create "+configFile, shell=True, stdout=subprocess.PIPE)
	prozess.wait()
	print machine+"+"+newStatus
	print prozess.stdout.read() 
	print prozess.returncode
	return  "<returncode>"+str(prozess.returncode)+"</returncode>"

def xmList():
	prozess = subprocess.Popen("/usr/sbin/xm list", shell=True,  stdout=subprocess.PIPE)
	output=""
	lineNumber=0
	for zeile in prozess.stdout:
		#ignore first line (header)     
		if lineNumber!=0:
			columns=""
			spalten=zeile.strip().split()
			columns="<machine>"+spalten[0]+"</machine>"
			columns+="<id>"+spalten[1]+"</id>"
			columns+="<mem>"+spalten[2]+"</mem>"
			columns+="<vcpus>"+spalten[3]+"</vcpus>"
			columns+="<state>"+spalten[4]+"</state>"
			columns+="<time>"+spalten[5]+"</time>"
			output+="<item name=\""+spalten[0]+"\">"+columns+"</item>"
		lineNumber+=1
	return output
	
def parseConfig(fileName):
	configData=loadFileContent(fileName)
	dummy, result={},{}
	exec configData in dummy, result
	return result
	
def loadFileContent(fileName):
	f= open(fileName)
	buffer=f.read()
	f.close()
	return buffer

def getParameter(url):
	params = {}
	index = url.rfind('?')
	if index >= 0:
		parts = url[index + 1:].split('&')
		for p in parts:
			try:
				a, b = p.split('=', 2)
				params[a] = b
			except:
				params[p] = ''
	return params

class MyHandler(BaseHTTPRequestHandler):

	def do_GET(self):
		#check, if default page
		print self.path
		if self.path== "/":
			self.path="/overview.html"
		try:
			#config.xml
			if self.path.endswith("config.xml"):
				self.send_response(200)
				self.send_header('Content-type',	'text/xml')
				self.end_headers()
				filePathList=glob.glob("/etc/xen/*.cfg")
				fileNameList=[]
				options=["name","boot","sdl","vnc","serial","acpi","apic","vnclisten","vfb","keymap","memory","vcpu"]
				for file in filePathList:
					filePath=file.split(sep)
					fileNameList.append(filePath[-1])
				fileNameList.sort()
				xmlContent=""
				
				for fileName in fileNameList:
					config=parseConfig('/etc/xen'+sep+fileName)
					xmlLine ="<filename>"+fileName+"</filename>"
					xmlLine+="<absolutefilename>"+'/etc/xen'+sep+fileName+"</absolutefilename>"
					for option in options:
						if option in config:
							xmlLine+="<"+option+">"+str(config[option])+"</"+option+">"
					diskLine=""
					for disk in config['disk']:
						diskLine+="<disk>"+disk+"</disk>"
					if diskLine!="":
						xmlLine+="<disks>"+diskLine+"</disks>"
					xmlContent+="<item name=\""+config['name']+"\">"+xmlLine+"</item>"
				f = open(curdir + sep + self.path)
				buffer=f.read()
				f.close()
				templateBody=Template(buffer)
				self.wfile.write(templateBody.substitute(body="<root>"+xmlContent+"</root>"))
				return
			#exec.xml
			if self.path.find("exec.xml")!=-1:
				parameter=getParameter(self.path)
				print parameter['machine']
				if(parameter['newStatus']=="start"):
					xmlContent=xmExec(parameter['machine'],parameter['newStatus'],urllib.unquote(parameter['configfile']))
				else:
					xmlContent=xmExec(parameter['machine'],parameter['newStatus'])
				pathParts=string.split(self.path,"?")
				fileName=pathParts[0]
				f = open(curdir + sep + fileName)
				buffer=f.read()
				f.close()
				templateBody=Template(buffer)
				self.wfile.write(templateBody.substitute(body="<root>"+xmlContent+"</root>"))
				return
			#runnings.xml
			if self.path.endswith("runnings.xml"):
				self.send_response(200)
				self.send_header('Content-type',	'text/xml')
				self.end_headers()
				xmlContent=xmList()
				f = open(curdir + sep + self.path)
				buffer=f.read()
				f.close()
				templateBody=Template(buffer)
				self.wfile.write(templateBody.substitute(body="<root>"+xmlContent+"</root>"))
				return
			#.html
			if self.path.endswith(".html"):
				
				self.send_response(200)
				self.send_header('Content-type',	'text/html')
				self.end_headers()
				buffer=loadFileContent(curdir + sep + self.path)
				self.wfile.write(buffer)
				return
			#css/jpg/...
			if self.path.endswith(".css") or self.path.endswith(".js") or self.path.endswith(".gif") or self.path.endswith(".jpg") or self.path.endswith(".png"):
				self.send_response(200)
				if self.path.endswith(".jpg"):
					self.send_header('Content-type',	'image/jpeg')
				if self.path.endswith(".gif"):
					self.send_header('Content-type',	'image/gif')
				if self.path.endswith(".png"):
					self.send_header('Content-type',	'image/png')
				if self.path.endswith(".css"):
					self.send_header('Content-type',	'text/css')
				if self.path.endswith(".js"):
					self.send_header('Content-type',	'application/javascript')
				self.end_headers()
				buffer=loadFileContent(curdir + sep + self.path)
				self.wfile.write(buffer)
				return
			return
				
		except IOError:
			self.send_error(404,'File Not Found: %s' % self.path)
	def do_POST(self):
		global rootnode
		try:
			ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
			if ctype == 'multipart/form-data':
				query=cgi.parse_multipart(self.rfile, pdict)
			self.send_response(301)
			
			self.end_headers()
			upfilecontent = query.get('upfile')
			print "filecontent", upfilecontent[0]
			self.wfile.write("<HTML>POST OK.<BR><BR>");
			self.wfile.write(upfilecontent[0]);
			
		except :
			pass

def main():
	try:
		server = HTTPServer(('', 80), MyHandler)
		print 'started httpserver...'
		server.serve_forever()
	except KeyboardInterrupt:
		print '^C received, shutting down server'
		server.socket.close()

if __name__ == '__main__':
	main()

