
select([A|As],S):- select(A,S,S1),select(As,S1).
select([],_).

next_to(A,B,C):- left_of(A,B,C) ; left_of(B,A,C).
left_of(A,B,C):- append(_,[A,B|_],C).

is_middle(A,L):- is_middle(A,L,L).
is_middle(A,[_,_|L],[_|R]):- is_middle(A,L,R).
is_middle(A,[_],[A|_]).

zebra(Owns, Hs):-  % color,nation,pet,drink,smokes
      length(Hs,5),                                              % 01 There are five houses
      H2   =   h(red,english,_,_,_),     member(   H2,     Hs),  % 02 The English man lives in the red house.
      H3   =   h(_,swede,dog,_,_),       member(   H3,     Hs),  % 03 The Swede has a dog.
      H4   =   h(_,dane,_,tea,_),        member(   H4,     Hs),  % 04 The Dane drinks tea.
      left_of( h(green,_,_,_,_),         h(white,_,_,_,_), Hs),  % 05 The green house is immediately to the left of the white house.
      H6   =   h(green,_,_,coffee,_),    member(   H6,     Hs),  % 06 They drink coffee in the green house.
      H7   =   h(_,_,birds,_,pallmall),  member(   H7,     Hs),  % 07 The man who smokes Pall Mall has birds.
      H8   =   h(yellow,_,_,_,dunhill),  member(   H8,     Hs),  % 08 In the yellow house they smoke Dunhill.
      H9   =   h(_,_,_,milk,_),          is_middle(H9,     Hs),  % 09 In the middle house they drink milk.
      Hs   = [ h(_,norwegian,_,_,_)|_],                          % 10 The Norwegian lives in the first house.
      next_to( h(_,_,_,_,blend),         h(_,_,cats, _,_), Hs),  % 11 The man who smokes Blend lives in the house next to the house with cats.
      next_to( h(_,_,_,_,dunhill),       h(_,_,horse,_,_), Hs),  % 12 In a house next to the house where they have a horse, they smoke Dunhill.
      H13  =   h(_,_,_,beer,bluemaster), member(   H13,    Hs),  % 13 The man who smokes Blue Master drinks beer.
      H14  =   h(_,german,_,_,prince),   member(   H14,    Hs),  % 14 The German smokes Prince.
      next_to( h(_,norwegian,_,_,_),     h(blue,_,_,_,_),  Hs),  % 15 The Norwegian lives next to the blue house.
      next_to( h(_,_,_,_,blend),         h(_,_,_,water,_), Hs),  % 16 They drink water in a house next to the house where they smoke Blend.
      member(  h(_,Owns,zebra,_,_),                        Hs).

main :-
    zebra(Who, HS), maplist(writeln,HS), nl, write(Who), nl, nl, fail
    ;
    write('No more solutions.').



exists(A, list(A, _, _, _, _)).
exists(A, list(_, A, _, _, _)).
exists(A, list(_, _, A, _, _)).
exists(A, list(_, _, _, A, _)).
exists(A, list(_, _, _, _, A)).

rightOf(R, L, list(L, R, _, _, _)).
rightOf(R, L, list(_, L, R, _, _)).
rightOf(R, L, list(_, _, L, R, _)).
rightOf(R, L, list(_, _, _, L, R)).

middle(A, list(_, _, A, _, _)).

first(A, list(A, _, _, _, _)).

nextTo(A, B, list(B, A, _, _, _)).
nextTo(A, B, list(_, B, A, _, _)).
nextTo(A, B, list(_, _, B, A, _)).
nextTo(A, B, list(_, _, _, B, A)).
nextTo(A, B, list(A, B, _, _, _)).
nextTo(A, B, list(_, A, B, _, _)).
nextTo(A, B, list(_, _, A, B, _)).
nextTo(A, B, list(_, _, _, A, B)).

puzzle(Houses) :-
  exists(house(red, england, _, _, _), Houses),
  exists(house(_, spain, _, _, dog), Houses),
  exists(house(_, japan, _, painter, _), Houses),
  exists(house(_, italy, tea, _, _), Houses),
  first(house(_, norway, _, _, _), Houses),
  rightOf(house(green, _, _, _, _), house(white, _, _, _, _), Houses),
  exists(house(_, _, _, photographer, snails), Houses),
  exists(house(yellow, _, _, diplomat, _), Houses),
  middle(house(_, _, milk, _, _), Houses),
  exists(house(green, _, coffee, _, _), Houses),
  nextTo(house(_, norway, _, _, _),house(blue, _, _, _, _), Houses),
  exists(house(_, _, juice, violinist, _), Houses),
  nextTo(house(_, _, _, physician, _),house(_, _, _, _, fox), Houses),
  nextTo(house(_, _, _, diplomat, _),house(_, _, _, _, horse), Houses),
  exists(house(_, _, water, _, _), Houses),
  exists(house(_, _, _, _, zebra), Houses).
