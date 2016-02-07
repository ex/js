##--------------------------------------
class Generator( object ):

    def __init__( self, name, elements ):
        self.name = name
        self.elements = elements
        self.next = None
        self.generated = None
        self.fixed = None
        self.unfixed = None
        self.constrains = []
        self.current = None

    @staticmethod
    def constrain( g1, e1, g2, e2, offset = 0 ):
        g1.addConstrain( e1, g2, e2, offset )
        g2.addConstrain( e2, g1, e1, offset )   

    def addConstrain( self, e, g2, e2, offset ):
        self.constrains.append( ( g2, e2, e, offset ) )

    def chain( self, next ):
        self.next = next
        return self

    def permute( self, m, z, a = 0 ):
        if a == len( z ):
            m.append( z[:] )
        else:
            for k in range( a, len( z ) ):
                z[a], z[k] = z[k], z[a]
                self.permute( m, z, a + 1 )
                z[a], z[k] = z[k], z[a]

    def generate( self ):
        self.generated = []
        if self.fixed == None:
            self.permute( self.generated, self.elements )
        elif len( self.fixed ) > 0:
            m = []
            self.permute( m, self.unfixed )
            for t in m:
                v = self.fixed[:]
                k = 0
                for i in range( 0, len( v ) ):
                    if v[i] == None:
                        v[i] = t[k]
                        k += 1
                self.generated.append( v )
        
    def fix( self, e, p ):
        if self.fixed == None:
            self.unfixed = self.elements[:]
            self.fixed = []
            for k in self.elements:
                self.fixed.append( None )
        try:
            self.unfixed.index( e )
            if self.fixed[p] == None:
                self.fixed[p] = e
                self.unfixed.remove( e )
            else:
                self.fixed = []
        except Exception as err:
            self.fixed = []
        
    def execute( self, callback, buffer = {} ):
        constrained = False
        oldFixed = self.fixed
        oldUnfixed = self.unfixed
        if self.fixed != None: oldFixed = self.fixed[:]
        if self.unfixed != None: oldUnfixed = self.unfixed[:]

        for c in self.constrains:
            if c[0].current != None:
                constrained = True
                self.fix( c[2], c[0].current.index( c[1] ) ) 

        if self.generated == None:
            self.generate()

        for e in self.generated:
            self.current = e
            buffer[self.name] = e
            if self.next == None:
                callback( buffer )
            else:
                self.next.execute( callback, buffer )
            del buffer[self.name]
        self.current = None

        if constrained:
            self.generated = None
            self.fixed = oldFixed
            self.unfixed = oldUnfixed

##--------------------------------------
def check( z ):
    colors = z['colors']
    nations = z['nations']
    jobs = z['jobs']
    pets = z['pets']
    ## 06. The green house is on the right of the white one.
    if colors.index( 'Green' ) != colors.index( 'White' ) + 1: return
    ## 11. The Norwegian's house is next to the blue one.
    if ( nations.index( 'Norwegian' ) != colors.index( 'Blue' ) + 1 ) and ( nations.index( 'Norwegian' ) != colors.index( 'Blue' ) - 1 ): return
    ## 13. The fox is in a house next to that of the physician.
    if ( pets.index( 'Fox' ) != jobs.index( 'Physician' ) + 1 ) and ( pets.index( 'Fox' ) != jobs.index( 'Physician' ) - 1 ): return
    ## 14. The horse is in a house next to that of the diplomat.
    if ( pets.index( 'Horse' ) != jobs.index( 'Diplomat' ) + 1 ) and ( pets.index( 'Horse' ) != jobs.index( 'Diplomat' ) - 1 ): return
    print( z )

##--------------------------------------
g1 = Generator( 'colors', ['Blue', 'Green', 'Red', 'White', 'Yellow'] )
g2 = Generator( 'nations', ['Englishman', 'Italian', 'Japanese', 'Norwegian', 'Spaniard'] )
g3 = Generator( 'jobs', ['Diplomat', 'Painter', 'Photographer', 'Physician', 'Violinist'] ) 
g4 = Generator( 'pets', ['Dog', 'Fox', 'Horse', 'Snails', 'Zebra'] ) 
g5 = Generator( 'drinks', ['Coffee', 'Milk', 'Juice', 'Tea', 'Water'] ) 
# g1 = Generator( ['Yellow', 'Blue', 'Red', 'White', 'Green'] )
# g2 = Generator( ['Norwegian', 'Italian', 'Englishman', 'Spaniard', 'Japanese'] )
# g3 = Generator( ['Diplomat', 'Physician', 'Photographer', 'Violinist', 'Painter'] ) 
# g4 = Generator( ['Fox', 'Horse', 'Snails', 'Dog', 'Zebra'] ) 
# g5 = Generator( ['Water', 'Tea', 'Milk', 'Juice', 'Coffee'] ) 

## 01. The Englishman lives in the red house.
Generator.constrain( g2, 'Englishman', g1, 'Red' )
## 02. The Spaniard owns a dog.
Generator.constrain( g2, 'Spaniard', g4, 'Dog' )
## 03. The Japanese man is a painter.
Generator.constrain( g2, 'Japanese', g3, 'Painter' )
## 04. The Italian drinks tea.
Generator.constrain( g2, 'Italian', g5, 'Tea' )
## 05. The Norwegian lives in the first house on the left.
g2.fix( 'Norwegian', 0 )
## 07. The photographer breeds snails.
Generator.constrain( g3, 'Photographer', g4, 'Snails' )
## 08. The diplomat lives in the yellow house.
Generator.constrain( g3, 'Diplomat', g1, 'Yellow' )
## 09. Milk is drunk in the middle house.
g5.fix( 'Milk', 2 )
## 10. The owner of the green house drinks coffee.
Generator.constrain( g1, 'Green', g5, 'Coffee' )
## 12. The violinist drinks orange juice.
Generator.constrain( g3, 'Violinist', g5, 'Juice' )

g1.chain( g2.chain( g3.chain( g4.chain( g5 ) ) ) )
g1.execute( check )

##--------------------------------------
def check_naive( z ):
    colors = z[0]
    nations = z[1]
    jobs = z[2]
    pets = z[3]
    drinks = z[4]
    ## 01. The Englishman lives in the red house.
    if nations.index( 'Englishman' ) != colors.index( 'Red' ): return
    ## 02. The Spaniard owns a dog.
    if nations.index( 'Spaniard' ) != pets.index( 'Dog' ): return    
    ## 03. The Japanese man is a painter.
    if nations.index( 'Japanese' ) != jobs.index( 'Painter' ): return        
    ## 04. The Italian drinks tea.
    if nations.index( 'Italian' ) != drinks.index( 'Tea' ): return        
    ## 05. The Norwegian lives in the first house on the left.
    if nations.index( 'Norwegian' ) != 0: return        
    ## 06. The green house is on the right of the white one.
    if colors.index( 'Green' ) != colors.index( 'White' ) + 1: return        
    ## 07. The photographer breeds snails.
    if jobs.index( 'Photographer' ) != pets.index( 'Snails' ): return
    ## 08. The diplomat lives in the yellow house.
    if jobs.index( 'Diplomat' ) != colors.index( 'Yellow' ): return        
    ## 09. Milk is drunk in the middle house.
    if drinks.index( 'Milk' ) != 2: return        
    ## 10. The owner of the green house drinks coffee.
    if colors.index( 'Green' ) != drinks.index( 'Coffee' ): return        
    ## 11. The Norwegian's house is next to the blue one.
    if ( nations.index( 'Norwegian' ) != colors.index( 'Blue' ) + 1 ) and ( nations.index( 'Norwegian' ) != colors.index( 'Blue' ) - 1 ): return
    ## 12. The violinist drinks orange juice.
    if jobs.index( 'Violinist' ) != drinks.index( 'Juice' ): return
    ## 13. The fox is in a house next to that of the physician.
    if ( pets.index( 'Fox' ) != jobs.index( 'Physician' ) + 1 ) and ( pets.index( 'Fox' ) != jobs.index( 'Physician' ) - 1 ): return    
    ## 14. The horse is in a house next to that of the diplomat.
    if ( pets.index( 'Horse' ) != jobs.index( 'Diplomat' ) + 1 ) and ( pets.index( 'Horse' ) != jobs.index( 'Diplomat' ) - 1 ): return        
    print( z )