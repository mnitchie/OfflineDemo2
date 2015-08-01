#Offline Demo 02

This repository contains a number of demo applications meant to show the capabilities, as well as the limits and challenges, of offline api-driven web applications.

As with [this](https://github.com/mnitchie/OfflineDemo01) project, here is a single repository that contains multiple [tagged releases](https://github.com/mnitchie/OfflineDemo02/releases), each one with incremental changes to the one before. Jump between tags with `git checkout VXX`, replacing XX with the desired version number. Run with `node app.js` after pulling the repo and checking out the required revision.

This application is a simple to-do list manager. The semantics in some of the modules of the early versions are a bit strange, as the final version(s) are intended to allow a list of to-do lists and the early versions only allow a simple flat list.

See [this](https://github.com/mnitchie/OfflineDemo01) repository for example usage of Application Cache alone

##V01
[View Demo](http://d2v1.mikenitchie.com)  

An offline-first implementation of a to-do list. After visiting the page for the first time, an internet connection is no longer needed to have full interaction.

In order to uniquely identify lists in offline mode, a random ID is generated for them. This ID is prefixed with `LOCAL-`.

The fields of a List object need some programatic protections, so a programmer can't overwrite Id or createDate fields, for example. However, these fields need to be accessible to the persistence layer for storage. Getters and setters were written for most fields, and a `getPersistable()` method exists which returns an Object containing the raw data for that List to be persisted.  

##V02
[View diffs](https://github.com/mnitchie/OfflineDemo02/compare/V01...V02)  <sub>(Lots of node module clutter. Relevant diffs all in StorageManager.js, app.js, and cache.manifest)</sub>  
[View Demo](http://d2v2.mikenitchie.com)  

To run this version of the app, MongoDB must be [installed](http://docs.mongodb.org/manual/installation/).

Beginning with this version I started using package.json to manage dependencies. It reduces clutter in the repo, but adds one extra step to run the app. Now `npm install`, then `node app.js` after pulling the repo and checking out the required revision.

In this version, the to-do list application is able to save lists to the server when online, but still persist to local storage when offline.

Care must be taken to keep track of the state of lists created offline to allow for proper syncing. For instance, when a new list is created or an existing list is modified offline, its `isDirty` property is set. Likewise, when a List is deleted offline its `isDeleted` property is set. When connection is re-established with the server after a refresh, Lists with these flags set will be persisted to the server, then the localStorage will be wiped out and re-populated with the fresh data from the server.

Syncing is hard. A few things to note:
  * The local ID set on offline-created Lists is ignored on the server in favor of the id set by the DB.
  * It makes no sense to delete a List from the server that only exists locally. If a user creates a List offline, then deletes that same List before going back online, the `deleted` flag is not set. Instead, the app checks to see if the List has an ID that is prefixed with `LOCAL-`. If so, it simply removes it from local storage. (A hacky approach, I admit, but still a case that needs to be handled.)
  * Syncing is done via a series of synchronous ajax calls. That makes me squirm a bit, but keeps the sync operation safe from conflicts or errors.
  * The cache.manifest file now has a `NETWORK` entry for the api endpoint serving up the List data. This allows that data to come through when online. When offline, the app loads data from local storage instead.

The browser doesn't immediately recognize when internet connection has been lost. It often takes 3-5 seconds(ish). During that time, it can send ajax requests to the server that will fail. Those errors can be handled by performing the same action in local storage, knowing that everything will get synced back up later.

For example, if a "POST" to the server fails, for any reason, always fall back to persisting it in local storage.

##V03
[View diffs](https://github.com/mnitchie/OfflineDemo02/compare/V02...V03)  
[View Demo](http://d2v3.mikenitchie.com)  

The app now detects changes in network status using the `online` and `offline` events on the `window` object (also available on `document` and `document.body`). Data will now sync when the user's connection status changes without requiring a refresh.

##V04
[View diffs](https://github.com/mnitchie/OfflineDemo02/compare/V03...V04)  
[View Demo](http://d2v4.mikenitchie.com)  

An extra feature is added in this version which completes the to-do list functionality. A list can be selected, and entries can be added to that list.

The code here is getting nastier and nastier. Several reasons:
  1. Managing the syncing of data between online and offline states is not trivial.
  2. I probably should have written this demo with Angular or some other SPA framework.
  2. I'm getting a bit lazy.
  3. I'm trying to prove a point. As an app gets more complex the data management becomes more and more difficult. There must be an easier way...

##V05
[View Diffs](https://github.com/mnitchie/OfflineDemo02/compare/V04...V05)  
[Compare to V01](https://github.com/mnitchie/OfflineDemo02/compare/V01...V05) <sub>(again, lots of node module garbage)</sub>  
[View Demo](http://d2v5.mikenitchie.com)  

MongoDB is no longer needed.

This is nearly<sup>*</sup> identical to V01, the offline version of the to-do list app. However, StorageManager.js now relies on PouchDB for local data persistence.

<sub>*: It is functionally identical. However, there is zombie code left in that will be used or modified in later versions.</sub>

##V06
[View diffs](https://github.com/mnitchie/OfflineDemo02/compare/V05...V06)  
[Compare with V03](https://github.com/mnitchie/OfflineDemo02/compare/V03...V06)  
[View Demo](http://d2v6.mikenitchie.com)  
Using couch on the server. Protip. Lemme save you 24 hours of hair pulling. Remember to put the url to your db in the network section of the cache manifest...

Enable coors
Set bind address to 0.0.0.0

Identical to V03. So Easy (hand wavy...). Persists online and detects change in network status.

##V07
[View diffs](https://github.com/mnitchie/OfflineDemo02/compare/V06...V07)  
 [Compare with V04](https://github.com/mnitchie/OfflineDemo02/compare/V04...V07)  
[View Demo](http://d2v7.mikenitchie.com)  

Final version. Functionally identical to V03, pouch/couch makes it so much simpler to manage data syncronization.
