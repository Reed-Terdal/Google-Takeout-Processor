# Google-Takeout-Processor
Utilities for unpacking a Google Takeout archive

[link to create a takeout](https://takeout.google.com/settings/takeout "Download your data")

---
## Parser.js
This program parses the Android activity file that can be found in your Google Takeout.

*Location: ./Takeout/My Activity/Android/MyActivity.html*

First clone the repo and run ```npm install```  to install the needed dependencies

The program can then be used with the following command:

```node parser.js <input file> <output file>```

 If successful it should print:
 
 *Found 49101 Events in Takeout\My Activity\MyActivity.html and wrote them to ./output.json*
 
