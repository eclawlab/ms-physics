# Soccer Common - Model Description

@author Matthew Blackman
<br>@author Marla Schulz
<br>@author Sam Reid

This document is a high-level description of the model used in PhET's _Soccer Common_ repository, which is used as a
foundation for simulations including _Center and Variability_ and _Mean Share and Balance_.

The _Soccer Common_ repository is used to create [Soccer Scenes](#soccer-scenes) in which one or
more [Kickers](#kickers) can kick [Soccer Balls](#soccer-balls), which land along a
horizontal [Number Line](#number-line) and stack vertically. The main functionalities of the model include:

## Soccer Scenes

Each _Soccer Scene_ contains an independent set of [Kickers](#kickers) and [Soccer Balls](#soccer-balls), which can be
kicked using a specific
[Kick Distribution Strategy](#kick-distribution-strategy). A simulation screen may contain one or more _Soccer Scenes_.

## Number Line

Each _Soccer Scene_ contains a horizontal number line, labeled with integer values.

## Kickers

The people kicking the soccer balls are referred to as _Kickers_. Each one has a set of images that show the person at
various phases of kicking a soccer ball. _KickerPhases_ can be _INACTIVE_, _READY_, _POISED_ or _KICKING_.

## Soccer Balls

The soccer balls that can be kicked within a given _Soccer Scene_. Each soccer ball has a null value until it lands, at
which time it takes an integer numerical value. Each soccer ball has a _SoccerBallPhase_ that describes the portion of
the kick it is currently in. _SoccerBallPhases_ can be _INACTIVE_, _READY_, _FLYING_, _STACKING_ or _STACKED_.

## Kick Distribution Strategy

Used to determine the distances for each kicked soccer ball. The kick distances create distributions that can be
randomly chosen to be left skewed, right skewed, or symmetric. The simulation is also capable of creating a distribution
based on exact distances per kick.

More information can be found in detail in _KickDistributionStrategy_.

For more information on how this model is used in context, please see the documentation in center-and-variability/doc
