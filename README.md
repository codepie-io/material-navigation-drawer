# Material Navigation Drawer

The **material navigation drawer** slides in and out from left/right of the screen as it is placed. 
It contains the navigation destinations for your app.The material expansion panel is created following
 [Material design guidelines](https://material.io/guidelines/components/buttons.html#)and the classes are named following the naming convention of 
 [BEM methodology](https://en.bem.info/methodology/naming-convention/).
                                                     


The different views of navigation drawer are:

## I. Web-view

**1.** When **data-permanent** custom attribute is set to **"true"**.

 The drawer appears in the body just below the header. As the drawer opens 
 the body content shifts its position in the direction the drawer is opened.
 
 To close the drawer, click on the hamburger button again.

**2.** When **data-permanent** custom attribute is set to **"false"**
 
  The drawer appears above the header and a shadow is casted on the body. As the drawer opens 
  the body content becomes static untill the drawer is closed.
  
  To close the drawer, click anywhere on the body.
 
**3.** When **Mini variant** custom attribute is set to **"true"**

  As you click on the hamburger button, the mini-variants i.e, the icons 
  of the navigation items appears first and remains fixed thereafter. On second click
  the drawer opens completely. 
    
  **Note:** The "data-permanent" custom attribute should be set to true for "mini-variant" to work. 
 
**4.** When **Mini variant** custom attribute is set to **"false"**

   The mini-variants will not get fixed.

## II. Mobile-view

 The mobile view of the drawer is same for all custom attribute state.


## Demo
 <a href="https://codeartisan-ui.github.io/material-navigation-drawer/" target="_blank">material-navigation-drawer</a>