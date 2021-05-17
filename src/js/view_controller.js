/***
 * Excerpted from "Seven Mobile Apps in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/7apps for more book information.
***/

/*
    Inhalt "view_controller.js"
    
    Managed die Anzeige aufgrund von Eingaben auf der Seite.
    Initialisierung in "main.js"
*/

(function($) {

    //Zugriff auf die HTML Elemente
    //Variablen Deklaration
  var namespaces = $.app.namespaces,
      clock = namespaces.models.Clock,
      timeZoneManager = namespaces.managers.TimeZoneManager,
      clockList = $("#clockList"),
      zoneList = $("#zoneList"),
      editLink = $("a#editLink"),
      addClockLink = $("a#addClockLink");

  var MainViewController = {


    initialize: function() {
      this.configureListeners();    //Binding
      this.refreshClockList();      //erstellt Liste von clocks für jede gespeicherte Zeitzone
      zoneList.hide();              //verbirgt die Liste der Zeitzonen (jquery)
      clock.start();                //startet das clock modul "ticking"

      timeZoneManager.fetchTimeZones(); //Abrufen der Zeitzonen
    },
      //Binding und Eventlistener hinzufügen
    configureListeners : function() {
      this.openZoneListFunction   = _.bind(this.addClockClicked, this);
      this.closeZoneListFunction  = _.bind(this.dismissZoneList, this);
      this.editFunction           = _.bind(this.editClicked, this);
      this.doneEditingFunction    = _.bind(this.doneClicked, this);
      this.deleteClockFunction    = _.bind(this.deleteClockClicked, this);
      addClockLink.click(this.openZoneListFunction);    //Event listener für "addClockLink"
      editLink.click(this.editFunction);                //Event listener für "editLink"
    },

      //Hinzufügen einer neuen Zeitzone und anschließende Darstellung der gespeicherten Zeitzonen
    addClockClicked : function() {
      if (zoneList.children().length === 0) {               //Wenn liste leer, werden neue Elemente erstellt
        //Definition von: var zones = alleZeitZonen, zoneClicked(), template;
          var zones = timeZoneManager.allZones(),           //Zugriff auf alle abgerufenen Zeitzonen
            clickHandler = _.bind(this.zoneClicked, this),  //Funktionsaufruf von "zoneClicked" hinter boundFunction "clickHandler"
            template = $("#timeZoneTemplate").text();       //Zugriff auf text Methode des Templates
        //Iteration aller Zeitzonen
        _.each(zones, function(zone, index) {
          var item = $(Mustache.render(template, zone));
          item.data("zoneIndex", index);
          item.click(clickHandler);
          zoneList.append(item);
        });
      }
      this.presentZoneList();
    },

      //Aufruf, wenn Element der Liste aus "addClockClicked" gedrückt
    zoneClicked : function(event) {
      var item = $(event.currentTarget),        //ermittelt den Index (position) des geklickten Elements
          index = item.data("zoneIndex");
      timeZoneManager.saveZoneAtIndex(index);   //fügt angeklicktes Element den gespeicherten Zeitzonen hinzu
      this.dismissZoneList();                   //Anpassung der Darstellung, Änderung der Callback Methoden
      this.refreshClockList();                  //
    },

      //Callback "editLink.click()"
    editClicked : function(event) {
      this.presentEditMode();
    },
      //Callback "editLink.click()" nach Edit mode
    doneClicked : function(event) {
      this.dismissEditMode();
    },
      
      //Darstellungsanpassung für "addClockLink"
    presentZoneList : function() {
      this.dismissEditMode();       //richtige Darstellung des Edit Buttons in  HTML -> Edit
      addClockLink.text("Cancel");  //ändert "addClockLink" Text in HTML
      addClockLink.off("click").    //ändert EventlistenerClick-Callback zu "closeZoneListFunction"
        click(this.closeZoneListFunction);
      zoneList.show();
    },
      //Darstellungsanpassung für "addClockLink"
    dismissZoneList : function() {
      addClockLink.text("Add Clock");   //ändert "addClockLink" Text in HTML
      addClockLink.off("click").        //ändert EventlistenerClick-Callback zu "openZoneListFunction" 
        click(this.openZoneListFunction);       //--> Aufruf von "addClockClicked": 
      zoneList.hide();                  //Verbirgt Zeitzonen Liste
    },
      //Darstellungsanpassung für "editLink"
    presentEditMode : function() {
      $(".delete-clock-link").show();   //Zeigt delete button an
      editLink.text("Done");            //ändert "editLink" in HTML
      editLink.off("click").            //ändert EventlistenerClick-Callback zu "doneEditingFunction" 
        click(this.doneEditingFunction);        //--> Aufruf von "doneClicked": aufruf von "dismissEditMode"
    },
      //Darstellungsanpassung für "editLink"
    dismissEditMode : function() {
      $(".delete-clock-link").hide();   //Verbergen des delete Buttons
      editLink.text("Edit");            //ändert "editLink" in HTML
      editLink.off("click").            //ändert EventlistenerClick-Callback zu "editFunction" 
        click(this.editFunction);
    },

      //erstellt Liste von clocks für jede gespeicherte Zeitzone
    refreshClockList : function() {
      var zones = timeZoneManager.savedZones(true),
          template = $("#clockTemplate").text();
      clockList.empty();    //jQuery: Löscht Inhalt des Elements  
      _.each(zones, function(zone, index) { 
        this.createClock(zone, index, template);     //Fügt neuen Inhalt der "clockList" hinzu
      }, this);
      $(".delete-clock-link").hide();   //Verbirgt den "delete" button
      clock.tick();
    },

      //Fügt neuen Inhalt der "clockList" hinzu
    createClock : function(zone, index, template) {
      var item = $(Mustache.render(template, zone)),
          deleteLink = item.find(".delete-clock-link");
      if (zone.isCurrent) {         //wenn in timeZoneManager.savedZones gespeichert, dann true
        deleteLink.remove();
      } else {
        deleteLink.data("clockIndex", index - 1);
        deleteLink.click(this.deleteClockFunction);
      }
      clockList.append(item);
    },

      //Löscht Clock aus "TimeZoneManger.savedTimeZone"
      //Löscht Element aus angezeigter Liste in HTML
    deleteClockClicked : function(event) {
      var clickedLink = $(event.currentTarget),
          index = clickedLink.data("clockIndex"),
          parentDiv = clickedLink.parents(".clock");
      timeZoneManager.deleteZoneAtIndex(index);
      parentDiv.remove();
    }

  };

    //Registrierung des dot-delimited namespaces: Zugriff wie in C# oder Javascript (siehe main.js)
  $.app.register("controllers.MainViewController", MainViewController);

})(jQuery);

